import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

// Metrics collection interface
export interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

// HTTP request metrics
export interface RequestMetrics {
  method: string;
  route: string;
  statusCode: number;
  duration: number;
  timestamp: number;
}

// Business metrics
export interface BusinessMetrics {
  expensesCreated: number;
  expensesApproved: number;
  expensesRejected: number;
  filesUploaded: number;
  usersActive: number;
  totalAmount: number;
}

// Metrics collector class
export class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();

  // Record a metric
  record(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    const metric: Metric = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);

    // Keep only last 1000 metrics per type
    const metricsArray = this.metrics.get(name)!;
    if (metricsArray.length > 1000) {
      metricsArray.splice(0, metricsArray.length - 1000);
    }
  }

  // Increment a counter
  increment(name: string, labels: Record<string, string> = {}): void {
    this.record(name, 1, labels);
  }

  // Record a histogram (for timing)
  histogram(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    this.record(`${name}_total`, value, labels);
    this.increment(`${name}_count`, labels);
  }

  // Get metrics for Prometheus format
  getPrometheusMetrics(): string {
    const output: string[] = [];

    for (const [name, metrics] of this.metrics) {
      // Group metrics by labels
      const grouped = new Map<string, number>();
      const counts = new Map<string, number>();

      for (const metric of metrics) {
        const labelStr = Object.entries(metric.labels || {})
          .map(([k, v]) => `${k}="${v}"`)
          .join(",");

        const key = labelStr ? `{${labelStr}}` : "";

        if (name.endsWith("_count")) {
          counts.set(key, (counts.get(key) || 0) + 1);
        } else {
          grouped.set(key, (grouped.get(key) || 0) + metric.value);
        }
      }

      // Output counters
      if (counts.size > 0) {
        output.push(`# TYPE ${name} counter`);
        for (const [labels, count] of counts) {
          output.push(`${name}${labels} ${count}`);
        }
      }

      // Output other metrics
      if (grouped.size > 0 && !name.endsWith("_count")) {
        const type =
          name.includes("duration") || name.includes("time")
            ? "histogram"
            : "gauge";
        output.push(`# TYPE ${name} ${type}`);
        for (const [labels, value] of grouped) {
          output.push(`${name}${labels} ${value}`);
        }
      }
    }

    return output.join("\n");
  }

  // Clear old metrics
  cleanup(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThanMs;

    for (const [name, metrics] of this.metrics) {
      const filtered = metrics.filter((m) => m.timestamp > cutoff);
      this.metrics.set(name, filtered);
    }
  }
}

// Global metrics collector
export const metricsCollector = new MetricsCollector();

// HTTP metrics middleware
export function withMetrics(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now();
    const method = request.method;
    const pathname = new URL(request.url).pathname;

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Record HTTP metrics
      metricsCollector.histogram(
        "http_request_duration_seconds",
        duration / 1000,
        {
          method,
          route: pathname,
          status_code: statusCode.toString(),
        }
      );

      metricsCollector.increment("http_requests_total", {
        method,
        route: pathname,
        status_code: statusCode.toString(),
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record error metrics
      metricsCollector.histogram(
        "http_request_duration_seconds",
        duration / 1000,
        {
          method,
          route: pathname,
          status_code: "500",
        }
      );

      metricsCollector.increment("http_requests_total", {
        method,
        route: pathname,
        status_code: "500",
      });

      throw error;
    }
  };
}

// Business metrics helpers
export const businessMetrics = {
  // Expense metrics
  expenseCreated: (amount: number, currency: string, category: string) => {
    metricsCollector.increment("expenses_created_total", {
      currency,
      category,
    });
    metricsCollector.record("expense_amount_total", amount, {
      currency,
      category,
    });
  },

  expenseSubmitted: (amount: number, currency: string) => {
    metricsCollector.increment("expenses_submitted_total", { currency });
    metricsCollector.record("submitted_amount_total", amount, { currency });
  },

  expenseApproved: (amount: number, currency: string, approverId: string) => {
    metricsCollector.increment("expenses_approved_total", { currency });
    metricsCollector.record("approved_amount_total", amount, { currency });
  },

  expenseRejected: (amount: number, currency: string, reason: string) => {
    metricsCollector.increment("expenses_rejected_total", { currency, reason });
  },

  // User metrics
  userLogin: (userId: string, method: string) => {
    metricsCollector.increment("user_logins_total", { method });
  },

  userRegistration: (companyId: string) => {
    metricsCollector.increment("users_registered_total", {
      company_id: companyId,
    });
  },

  // File metrics
  fileUploaded: (fileSize: number, fileType: string) => {
    metricsCollector.increment("files_uploaded_total", { type: fileType });
    metricsCollector.record("file_size_bytes_total", fileSize, {
      type: fileType,
    });
  },

  ocrProcessed: (success: boolean, processingTime: number) => {
    metricsCollector.increment("ocr_processed_total", {
      success: success.toString(),
    });
    metricsCollector.histogram(
      "ocr_processing_duration_seconds",
      processingTime / 1000
    );
  },

  // Email metrics
  emailSent: (type: string, success: boolean) => {
    metricsCollector.increment("emails_sent_total", {
      type,
      success: success.toString(),
    });
  },

  // Report metrics
  reportGenerated: (type: string, format: string, recordCount: number) => {
    metricsCollector.increment("reports_generated_total", { type, format });
    metricsCollector.record("report_record_count", recordCount, {
      type,
      format,
    });
  },

  // Cache metrics
  cacheHit: (key: string) => {
    metricsCollector.increment("cache_hits_total", { cache_key: key });
  },

  cacheMiss: (key: string) => {
    metricsCollector.increment("cache_misses_total", { cache_key: key });
  },

  // Database metrics
  dbQuery: (table: string, operation: string, duration: number) => {
    metricsCollector.histogram("db_query_duration_seconds", duration / 1000, {
      table,
      operation,
    });
    metricsCollector.increment("db_queries_total", { table, operation });
  },
};

// Performance monitoring
export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  labels: Record<string, string> = {}
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      metricsCollector.histogram(
        `${operation}_duration_seconds`,
        duration / 1000,
        labels
      );
      metricsCollector.increment(`${operation}_total`, {
        ...labels,
        success: "true",
      });

      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;

      metricsCollector.histogram(
        `${operation}_duration_seconds`,
        duration / 1000,
        labels
      );
      metricsCollector.increment(`${operation}_total`, {
        ...labels,
        success: "false",
      });

      reject(error);
    }
  });
}

// Health check metrics
export async function getSystemHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  checks: Record<string, boolean>;
  metrics: any;
}> {
  const checks = {
    database: false,
    redis: false,
    fileStorage: false,
  };

  try {
    // Database check
    const { checkDatabaseConnection } = await import("@/lib/prisma");
    checks.database = await checkDatabaseConnection();

    // Redis check
    const { checkRedisConnection } = await import("@/lib/redis");
    checks.redis = await checkRedisConnection();

    // File storage check (simplified)
    checks.fileStorage = true; // You could implement S3 health check

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (healthyChecks === 0) {
      status = "unhealthy";
    } else if (healthyChecks < totalChecks) {
      status = "degraded";
    }

    return {
      status,
      checks,
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      checks,
      metrics: {
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Metrics endpoint handler
export async function handleMetricsRequest(): Promise<NextResponse> {
  try {
    const metrics = metricsCollector.getPrometheusMetrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate metrics" },
      { status: 500 }
    );
  }
}

// Cleanup job (run periodically)
export function startMetricsCleanup(): void {
  setInterval(() => {
    metricsCollector.cleanup();
  }, 60 * 60 * 1000); // Clean up every hour
}

// Example usage:
/*
import { withMetrics, businessMetrics, measurePerformance } from '@/middleware/metrics';

export const POST = withMetrics(async (request: NextRequest) => {
  const result = await measurePerformance('expense_creation', async () => {
    // Your business logic here
    const expense = await createExpense(data);
    
    businessMetrics.expenseCreated(expense.amount, expense.currency, expense.category);
    
    return expense;
  });
  
  return NextResponse.json(result);
});
*/

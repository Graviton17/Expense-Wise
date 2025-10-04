import Queue from "bull";
import { getRedisClient } from "./redis";

// Queue configuration
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Create queues
export const ocrQueue = new Queue("OCR Processing", REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 10,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export const emailQueue = new Queue("Email Sending", REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const reportQueue = new Queue("Report Generation", REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 5,
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

// Job types and interfaces
export interface OCRJobData {
  receiptId: string;
  fileUrl: string;
  fileName: string;
  userId: string;
  companyId: string;
}

export interface EmailJobData {
  type:
    | "welcome"
    | "password-reset"
    | "expense-submitted"
    | "expense-approved"
    | "expense-rejected"
    | "monthly-report";
  to: string | string[];
  data: Record<string, any>;
}

export interface ReportJobData {
  type: "expense-report" | "monthly-summary";
  userId: string;
  companyId: string;
  parameters: Record<string, any>;
  format: "pdf" | "csv" | "excel";
}

// Job priority levels
export const JobPriority = {
  LOW: 1,
  NORMAL: 5,
  HIGH: 10,
  CRITICAL: 15,
} as const;

// Add OCR job
export async function addOCRJob(
  data: OCRJobData,
  priority: number = JobPriority.NORMAL
): Promise<void> {
  try {
    await ocrQueue.add("process-receipt", data, {
      priority,
      delay: 1000, // Small delay to ensure database transaction is committed
    });
    console.log(`OCR job added for receipt: ${data.receiptId}`);
  } catch (error) {
    console.error("Failed to add OCR job:", error);
    throw error;
  }
}

// Add email job
export async function addEmailJob(
  data: EmailJobData,
  priority: number = JobPriority.NORMAL
): Promise<void> {
  try {
    await emailQueue.add("send-email", data, {
      priority,
    });
    console.log(`Email job added: ${data.type} to ${data.to}`);
  } catch (error) {
    console.error("Failed to add email job:", error);
    throw error;
  }
}

// Add report generation job
export async function addReportJob(
  data: ReportJobData,
  priority: number = JobPriority.LOW
): Promise<string> {
  try {
    const job = await reportQueue.add("generate-report", data, {
      priority,
    });
    console.log(`Report job added: ${data.type} for user ${data.userId}`);
    return job.id.toString();
  } catch (error) {
    console.error("Failed to add report job:", error);
    throw error;
  }
}

// Get job status
export async function getJobStatus(
  queueName: string,
  jobId: string
): Promise<any> {
  try {
    let queue: Queue.Queue;

    switch (queueName) {
      case "ocr":
        queue = ocrQueue;
        break;
      case "email":
        queue = emailQueue;
        break;
      case "report":
        queue = reportQueue;
        break;
      default:
        throw new Error("Invalid queue name");
    }

    const job = await queue.getJob(jobId);

    if (!job) {
      return { status: "not-found" };
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  } catch (error) {
    console.error("Failed to get job status:", error);
    throw error;
  }
}

// Queue monitoring and health check
export async function getQueueHealth(): Promise<{
  ocr: any;
  email: any;
  report: any;
}> {
  try {
    const [ocrStats, emailStats, reportStats] = await Promise.all([
      ocrQueue.getJobCounts(),
      emailQueue.getJobCounts(),
      reportQueue.getJobCounts(),
    ]);

    return {
      ocr: ocrStats,
      email: emailStats,
      report: reportStats,
    };
  } catch (error) {
    console.error("Failed to get queue health:", error);
    throw error;
  }
}

// Clean up completed and failed jobs
export async function cleanupQueues(): Promise<void> {
  try {
    await Promise.all([
      ocrQueue.clean(24 * 60 * 60 * 1000, "completed"), // 1 day
      ocrQueue.clean(7 * 24 * 60 * 60 * 1000, "failed"), // 7 days
      emailQueue.clean(24 * 60 * 60 * 1000, "completed"),
      emailQueue.clean(7 * 24 * 60 * 60 * 1000, "failed"),
      reportQueue.clean(24 * 60 * 60 * 1000, "completed"),
      reportQueue.clean(7 * 24 * 60 * 60 * 1000, "failed"),
    ]);
    console.log("Queue cleanup completed");
  } catch (error) {
    console.error("Queue cleanup failed:", error);
  }
}

// Graceful shutdown
export async function closeQueues(): Promise<void> {
  try {
    await Promise.all([
      ocrQueue.close(),
      emailQueue.close(),
      reportQueue.close(),
    ]);
    console.log("All queues closed successfully");
  } catch (error) {
    console.error("Failed to close queues:", error);
  }
}

// Queue event listeners for monitoring
ocrQueue.on("completed", (job, result) => {
  console.log(`OCR job ${job.id} completed:`, result);
});

ocrQueue.on("failed", (job, err) => {
  console.error(`OCR job ${job.id} failed:`, err);
});

emailQueue.on("completed", (job, result) => {
  console.log(`Email job ${job.id} completed:`, result);
});

emailQueue.on("failed", (job, err) => {
  console.error(`Email job ${job.id} failed:`, err);
});

reportQueue.on("completed", (job, result) => {
  console.log(`Report job ${job.id} completed:`, result);
});

reportQueue.on("failed", (job, err) => {
  console.error(`Report job ${job.id} failed:`, err);
});

export { Queue };

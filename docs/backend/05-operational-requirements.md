# Operational Requirements Documentation

## Overview

This document outlines the non-functional requirements for the Expense-Wise application, including observability, scalability, security, and reliability standards.

## Table of Contents

1. [Observability](#1-observability)
2. [Scalability and High Availability](#2-scalability-and-high-availability)
3. [Security and Compliance](#3-security-and-compliance)
4. [Performance Requirements](#4-performance-requirements)
5. [Disaster Recovery](#5-disaster-recovery)
6. [SLA Definitions](#6-sla-definitions)

---

## 1. Observability

### 1.1 Logging Strategy

**Centralized Structured Logging** using JSON format with ELK Stack (Elasticsearch, Logstash, Kibana).

#### Log Levels

- **ERROR**: Critical failures requiring immediate attention
- **WARN**: Warning conditions that may require investigation
- **INFO**: Important business events and milestones
- **DEBUG**: Detailed diagnostic information (development only)

#### Log Structure

```json
{
  "timestamp": "2025-10-04T12:00:00.000Z",
  "level": "INFO",
  "service": "expense-service",
  "traceId": "abc-123-def-456",
  "spanId": "span-789",
  "userId": "user_xyz789",
  "companyId": "comp_abc123",
  "method": "POST",
  "path": "/api/v1/expenses",
  "statusCode": 201,
  "duration": 145,
  "message": "Expense created successfully",
  "metadata": {
    "expenseId": "exp_abc123",
    "amount": 125.5,
    "currency": "USD"
  }
}
```

#### Logging Implementation (Node.js/Winston)

```javascript
// config/logger.js
const winston = require("winston");
const { ElasticsearchTransport } = require("winston-elasticsearch");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || "expense-wise",
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Elasticsearch for production
    new ElasticsearchTransport({
      level: "info",
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
      },
      index: "expensewise-logs",
    }),
  ],
});

// Add correlation ID to all logs
logger.addContext = (req, res, next) => {
  req.log = logger.child({
    traceId: req.headers["x-trace-id"] || generateTraceId(),
    userId: req.user?.id,
    companyId: req.user?.companyId,
  });
  next();
};

module.exports = logger;
```

### 1.2 Monitoring (Prometheus + Grafana)

**RED Method** - Track these key metrics for all services:

- **Rate**: Requests per second
- **Errors**: Error rate percentage
- **Duration**: Response time distribution

#### Metrics to Track

**Application Metrics**:

```
# HTTP Requests
http_requests_total{method, path, status}
http_request_duration_seconds{method, path}

# Business Metrics
expenses_created_total{company_id}
expenses_approved_total{company_id}
expenses_rejected_total{company_id}
receipt_uploads_total{company_id}
ocr_processing_duration_seconds

# Queue Metrics
queue_jobs_waiting{queue_name}
queue_jobs_active{queue_name}
queue_jobs_completed{queue_name}
queue_jobs_failed{queue_name}

# Database Metrics
db_connections_active
db_connections_idle
db_query_duration_seconds
```

#### Prometheus Implementation

```javascript
// config/metrics.js
const promClient = require("prom-client");

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
});

const expensesCreated = new promClient.Counter({
  name: "expenses_created_total",
  help: "Total number of expenses created",
  labelNames: ["company_id", "category"],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(expensesCreated);

// Metrics middleware
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });

  next();
}

module.exports = {
  register,
  metricsMiddleware,
  expensesCreated,
};
```

### 1.3 Distributed Tracing (Jaeger/OpenTelemetry)

**Track request flow across microservices** to identify performance bottlenecks.

```javascript
// config/tracing.js
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");

const provider = new NodeTracerProvider();

const exporter = new JaegerExporter({
  serviceName: process.env.SERVICE_NAME,
  endpoint: process.env.JAEGER_ENDPOINT,
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

console.log("Tracing initialized");
```

### 1.4 Health Checks

```javascript
// routes/health.js
const express = require("express");
const { prisma } = require("../db");
const redis = require("../config/redis");

const router = express.Router();

// Basic liveness check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Detailed readiness check
router.get("/health/ready", async (req, res) => {
  const checks = {
    database: "unknown",
    redis: "unknown",
    s3: "unknown",
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "healthy";
  } catch (error) {
    checks.database = "unhealthy";
  }

  try {
    // Check Redis
    await redis.ping();
    checks.redis = "healthy";
  } catch (error) {
    checks.redis = "unhealthy";
  }

  const allHealthy = Object.values(checks).every(
    (status) => status === "healthy"
  );
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? "ready" : "not ready",
    checks,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
```

---

## 2. Scalability and High Availability

### 2.1 Horizontal Scaling Strategy

**Stateless Application Design**:

- All services are stateless
- Session data stored in Redis
- No local file storage (use S3)
- Can scale to N instances

**Kubernetes Deployment**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expense-service
spec:
  replicas: 3 # Minimum 3 for HA
  selector:
    matchLabels:
      app: expense-service
  template:
    metadata:
      labels:
        app: expense-service
    spec:
      containers:
        - name: expense-service
          image: expensewise/expense-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: expense-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: expense-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 2.2 Database Scalability

**PostgreSQL Configuration**:

- **Primary**: Write operations
- **Read Replicas**: Read-heavy operations (reports, analytics)
- **Connection Pooling**: PgBouncer (max 100 connections)

```javascript
// config/database.js
const { Pool } = require("pg");

// Write pool (primary)
const writePool = new Pool({
  host: process.env.DB_WRITE_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Read pool (replica)
const readPool = new Pool({
  host: process.env.DB_READ_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = { writePool, readPool };
```

### 2.3 Load Balancing

**NGINX Configuration**:

```nginx
upstream expense_backend {
    least_conn;
    server expense-1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server expense-2:3000 weight=1 max_fails=3 fail_timeout=30s;
    server expense-3:3000 weight=1 max_fails=3 fail_timeout=30s;

    keepalive 32;
}

server {
    listen 80;
    server_name api.expensewise.com;

    location / {
        proxy_pass http://expense_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 2.4 Circuit Breaker Pattern

```javascript
// utils/circuitBreaker.js
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 10000;
    this.resetTimeout = options.resetTimeout || 60000;

    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async call(...args) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await Promise.race([
        this.fn(...args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), this.timeout)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
    }
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}
```

---

## 3. Security and Compliance

### 3.1 Data Encryption

**In Transit**:

- TLS 1.3 for all external communications
- mTLS for service-to-service communication
- Certificate management with Let's Encrypt

**At Rest**:

- Database encryption (PostgreSQL native encryption)
- S3 bucket encryption (AES-256)
- Encrypted backups

### 3.2 Security Headers

```javascript
// middleware/security.js
const helmet = require("helmet");

module.exports = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://cdn.expensewise.com"],
      connectSrc: ["'self'", "https://api.expensewise.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
```

### 3.3 Rate Limiting

```javascript
// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redis = require("../config/redis");

// API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: "rl:api:",
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: "rl:auth:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
});

module.exports = { apiLimiter, authLimiter };
```

### 3.4 Input Validation

```javascript
// middleware/validator.js
const { z } = require("zod");

const expenseSchema = z.object({
  amount: z.number().positive().max(100000),
  currency: z.enum(["USD", "EUR", "GBP"]),
  category: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
  date: z.string().datetime(),
  merchantName: z.string().max(200).optional(),
});

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
  };
}

module.exports = { validateRequest, expenseSchema };
```

### 3.5 SQL Injection Prevention

**Always use parameterized queries with Prisma ORM**:

```javascript
// ✅ Good - Safe from SQL injection
const expenses = await prisma.expense.findMany({
  where: {
    userId: req.user.id,
    status: req.query.status,
  },
});

// ❌ Bad - Vulnerable to SQL injection
const expenses = await prisma.$queryRaw`
  SELECT * FROM expenses WHERE userId = ${req.user.id} AND status = ${req.query.status}
`;
```

---

## 4. Performance Requirements

### 4.1 SLA Targets

| Metric                  | Target   | Measurement            |
| ----------------------- | -------- | ---------------------- |
| API Response Time (P95) | < 500ms  | 95% of requests        |
| API Response Time (P99) | < 1000ms | 99% of requests        |
| API Availability        | 99.9%    | Monthly uptime         |
| OCR Processing Time     | < 30s    | Average                |
| Database Query Time     | < 100ms  | Average                |
| Page Load Time          | < 2s     | First contentful paint |

### 4.2 Performance Optimization Checklist

**Database**:

- ✅ Proper indexing on frequently queried columns
- ✅ Connection pooling
- ✅ Query result caching
- ✅ Pagination for large datasets
- ✅ Database query optimization

**API**:

- ✅ Response compression (gzip)
- ✅ HTTP/2 support
- ✅ CDN for static assets
- ✅ API response caching
- ✅ Async processing for heavy operations

**Frontend**:

- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Service worker caching
- ✅ Bundle size optimization

---

## 5. Disaster Recovery

### 5.1 Backup Strategy

**Database Backups**:

- **Full Backup**: Daily at 2 AM UTC
- **Incremental Backup**: Every 6 hours
- **Retention**: 30 days
- **Location**: AWS S3 with cross-region replication

**Application Backups**:

- **Container Images**: Stored in container registry with versioning
- **Configuration**: Version controlled in Git
- **Secrets**: Backed up in secure vault

### 5.2 Recovery Procedures

**RTO (Recovery Time Objective)**: 1 hour  
**RPO (Recovery Point Objective)**: 6 hours

**Recovery Steps**:

1. Provision new infrastructure (Terraform)
2. Restore database from latest backup
3. Deploy application containers
4. Verify system health
5. Update DNS/load balancer
6. Monitor and validate

---

## 6. SLA Definitions

### 6.1 Service Level Objectives

**Availability**: 99.9% uptime per month

- Allowed downtime: ~43 minutes per month

**Performance**:

- API response time: P95 < 500ms, P99 < 1s
- OCR processing: < 30 seconds average

**Support**:

- Critical issues: Response within 1 hour
- High priority: Response within 4 hours
- Normal priority: Response within 24 hours

### 6.2 Incident Classification

| Severity      | Definition                | Response Time | Examples                      |
| ------------- | ------------------------- | ------------- | ----------------------------- |
| P1 - Critical | Complete service outage   | 15 minutes    | API down, database failure    |
| P2 - High     | Major feature unavailable | 1 hour        | OCR not working, login issues |
| P3 - Medium   | Minor feature degraded    | 4 hours       | Slow performance, UI bugs     |
| P4 - Low      | Cosmetic issues           | 24 hours      | Typos, minor UI issues        |

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0

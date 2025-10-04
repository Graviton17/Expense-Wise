# Backend Subsystems Documentation

## Overview

This document details the critical backend subsystems that power the Expense-Wise application, including authentication, async processing, caching, file storage, and notification systems.

## Table of Contents

1. [Authentication and Authorization](#1-authentication-and-authorization)
2. [Asynchronous Task Processing](#2-asynchronous-task-processing)
3. [Caching Strategy](#3-caching-strategy)
4. [File Storage and Management](#4-file-storage-and-management)
5. [OCR Processing Pipeline](#5-ocr-processing-pipeline)
6. [Email and Notification System](#6-email-and-notification-system)

---

## 1. Authentication and Authorization

### 1.1 OAuth 2.0 + JWT Hybrid Implementation

**Design Decision**: We use OAuth 2.0 as the authorization framework with JWT (JSON Web Tokens) as the token format, providing a balance between security and scalability.

#### Token Structure

**Access Token (Short-lived: 1 hour)**

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-123"
  },
  "payload": {
    "sub": "user_xyz789",
    "iss": "https://api.expensewise.com",
    "aud": "expensewise-api",
    "exp": 1696435200,
    "iat": 1696431600,
    "jti": "token_unique_id",
    "role": "EMPLOYEE",
    "companyId": "comp_abc123",
    "permissions": ["expense:create", "expense:read", "receipt:upload"]
  },
  "signature": "..."
}
```

**Refresh Token (Long-lived: 30 days)**

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_xyz789",
    "iss": "https://api.expensewise.com",
    "exp": 1699027200,
    "iat": 1696431600,
    "jti": "refresh_unique_id",
    "type": "refresh"
  },
  "signature": "..."
}
```

### 1.2 Token Management

#### Token Generation (Node.js Example)

```javascript
// services/auth/tokenService.js
const jwt = require("jsonwebtoken");
const fs = require("fs");

class TokenService {
  constructor() {
    this.privateKey = fs.readFileSync("keys/private.pem", "utf8");
    this.publicKey = fs.readFileSync("keys/public.pem", "utf8");
  }

  generateAccessToken(user) {
    const payload = {
      sub: user.id,
      iss: process.env.JWT_ISSUER,
      aud: "expensewise-api",
      role: user.role,
      companyId: user.companyId,
      permissions: this.getUserPermissions(user.role),
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      jwtid: this.generateJti(),
    });
  }

  generateRefreshToken(user) {
    const payload = {
      sub: user.id,
      iss: process.env.JWT_ISSUER,
      type: "refresh",
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: "RS256",
      expiresIn: "30d",
      jwtid: this.generateJti(),
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ["RS256"],
      });
    } catch (error) {
      throw new AuthenticationError("Invalid token");
    }
  }

  getUserPermissions(role) {
    const permissions = {
      ADMIN: ["*"],
      MANAGER: [
        "expense:read:team",
        "expense:approve",
        "expense:reject",
        "user:read",
        "report:read",
      ],
      EMPLOYEE: [
        "expense:create",
        "expense:read:own",
        "expense:update:own",
        "expense:delete:own",
        "receipt:upload",
      ],
    };
    return permissions[role] || [];
  }

  generateJti() {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new TokenService();
```

### 1.3 Token Blacklist (Redis Implementation)

```javascript
// services/auth/blacklistService.js
const Redis = require("ioredis");

class BlacklistService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    });
  }

  async addToBlacklist(jti, expiresIn) {
    const key = `blacklist:${jti}`;
    await this.redis.set(key, "1", "EX", expiresIn);
  }

  async isBlacklisted(jti) {
    const key = `blacklist:${jti}`;
    const result = await this.redis.get(key);
    return result !== null;
  }

  async removeFromBlacklist(jti) {
    const key = `blacklist:${jti}`;
    await this.redis.del(key);
  }
}

module.exports = new BlacklistService();
```

### 1.4 Authentication Middleware

```javascript
// middleware/authenticate.js
const tokenService = require("../services/auth/tokenService");
const blacklistService = require("../services/auth/blacklistService");

async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: "Missing or invalid authorization header",
        },
      });
    }

    const token = authHeader.substring(7);

    // Verify token signature and expiration
    const decoded = tokenService.verifyToken(token);

    // Check if token is blacklisted
    const isBlacklisted = await blacklistService.isBlacklisted(decoded.jti);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: "Token has been revoked",
        },
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      companyId: decoded.companyId,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: error.message || "Authentication failed",
      },
    });
  }
}

module.exports = authenticate;
```

### 1.5 Authorization Middleware (RBAC)

```javascript
// middleware/authorize.js
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: "User not authenticated",
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Insufficient permissions",
        },
      });
    }

    next();
  };
}

// Permission-based authorization
function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: "User not authenticated",
        },
      });
    }

    // Admin has all permissions
    if (req.user.permissions.includes("*")) {
      return next();
    }

    const hasPermission = requiredPermissions.every((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Insufficient permissions",
        },
      });
    }

    next();
  };
}

module.exports = { authorize, requirePermission };
```

---

## 2. Asynchronous Task Processing

### 2.1 Task Queue Architecture

**Technology**: Bull (Redis-based queue for Node.js) or Celery (Python)

```
┌──────────────┐
│  API Server  │
│              │
└──────┬───────┘
       │ 1. Create Job
       ▼
┌──────────────┐       ┌─────────────────┐
│    Redis     │◄──────┤   Bull Queue    │
│   (Broker)   │       │   (Job Store)   │
└──────┬───────┘       └─────────────────┘
       │ 2. Job Available
       ▼
┌──────────────┐       ┌─────────────────┐
│   Worker 1   │       │    Worker 2     │
│ (OCR Process)│       │ (Email Sender)  │
└──────┬───────┘       └────────┬────────┘
       │                        │
       │ 3. Process Job         │ 3. Process Job
       ▼                        ▼
┌──────────────┐       ┌─────────────────┐
│  Update DB   │       │  Send Email     │
└──────────────┘       └─────────────────┘
```

### 2.2 Queue Implementation (Bull/Node.js)

```javascript
// queues/index.js
const Queue = require("bull");

// Define queues
const ocrQueue = new Queue("ocr-processing", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

const emailQueue = new Queue("email-sending", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

const reportQueue = new Queue("report-generation", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 2,
    timeout: 300000, // 5 minutes
  },
});

module.exports = {
  ocrQueue,
  emailQueue,
  reportQueue,
};
```

### 2.3 Job Producer Example

```javascript
// services/receipt/receiptService.js
const { ocrQueue } = require("../../queues");

class ReceiptService {
  async uploadReceipt(file, userId) {
    // Save file metadata to database
    const receipt = await prisma.receipt.create({
      data: {
        filename: file.originalname,
        fileUrl: file.location, // S3 URL
        fileSize: file.size,
        mimeType: file.mimetype,
        userId,
        status: "PROCESSING",
      },
    });

    // Add OCR job to queue
    const job = await ocrQueue.add(
      "process-receipt",
      {
        receiptId: receipt.id,
        fileUrl: file.location,
        userId,
      },
      {
        priority: 10,
        jobId: `ocr_${receipt.id}`,
      }
    );

    return {
      receipt,
      ocrJobId: job.id,
    };
  }
}
```

### 2.4 Worker Implementation

```javascript
// workers/ocrWorker.js
const { ocrQueue } = require("../queues");
const Tesseract = require("tesseract.js");
const { prisma } = require("../db");

// Process OCR jobs
ocrQueue.process("process-receipt", 5, async (job) => {
  const { receiptId, fileUrl, userId } = job.data;

  try {
    // Update progress
    job.progress(10);

    // Download image from S3
    const imageBuffer = await downloadFromS3(fileUrl);
    job.progress(30);

    // Perform OCR
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(imageBuffer, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          job.progress(30 + m.progress * 50);
        }
      },
    });

    // Parse OCR text to extract expense data
    const ocrData = parseReceiptText(text);
    job.progress(90);

    // Update receipt in database
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: "COMPLETED",
        ocrData: ocrData,
        ocrConfidence: confidence,
        processedAt: new Date(),
      },
    });

    // Publish event
    await publishEvent("receipt.processed", {
      receiptId,
      userId,
      ocrData,
    });

    job.progress(100);

    return { success: true, receiptId, ocrData };
  } catch (error) {
    console.error("OCR processing failed:", error);

    // Update receipt status
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: "FAILED",
        errorMessage: error.message,
      },
    });

    throw error;
  }
});

// Job event handlers
ocrQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

ocrQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

ocrQueue.on("stalled", (job) => {
  console.warn(`Job ${job.id} stalled`);
});

console.log("OCR worker started");
```

### 2.5 Job Monitoring

```javascript
// routes/tasks.js
const express = require("express");
const { ocrQueue, emailQueue, reportQueue } = require("../queues");

const router = express.Router();

// Get job status
router.get("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  // Check all queues
  const queues = [ocrQueue, emailQueue, reportQueue];

  for (const queue of queues) {
    const job = await queue.getJob(taskId);

    if (job) {
      const state = await job.getState();
      const progress = job.progress();

      return res.json({
        success: true,
        data: {
          taskId: job.id,
          status: state,
          progress,
          data: job.data,
          result: await job.finished().catch(() => null),
        },
      });
    }
  }

  res.status(404).json({
    success: false,
    error: {
      code: "TASK_NOT_FOUND",
      message: "Task not found",
    },
  });
});

module.exports = router;
```

---

## 3. Caching Strategy

### 3.1 Multi-Layer Caching Architecture

```
┌───────────────────────────────────────────────────────┐
│                    Client Layer                       │
│              (Browser Cache, Service Worker)          │
└────────────────────────┬──────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────┐
│                    CDN Layer                          │
│            (CloudFront, Cloudflare)                   │
│           - Static assets (images, CSS, JS)           │
│           - Receipt thumbnails                        │
└────────────────────────┬──────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────┐
│              Application Cache Layer                  │
│                  (Redis Cluster)                      │
│           - Session data                              │
│           - API response cache                        │
│           - User permissions                          │
└────────────────────────┬──────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────┐
│                 Database Layer                        │
│                  (PostgreSQL)                         │
│           - Query result cache                        │
│           - Materialized views                        │
└───────────────────────────────────────────────────────┘
```

### 3.2 Cache-Aside Pattern (Lazy Loading)

```javascript
// services/cache/cacheService.js
const Redis = require("ioredis");

class CacheService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      keyPrefix: "expensewise:",
    });
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  async invalidatePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Cache invalidate error:", error);
      return false;
    }
  }
}

module.exports = new CacheService();
```

### 3.3 Caching Middleware

```javascript
// middleware/cache.js
const cacheService = require("../services/cache/cacheService");

function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `api:${req.originalUrl}:${req.user?.id || "anonymous"}`;

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
      }

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode === 200 && data.success) {
          cacheService.set(cacheKey, data.data, ttl);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
}

module.exports = cacheMiddleware;
```

### 3.4 Cache Invalidation Strategy

```javascript
// services/expense/expenseService.js
const cacheService = require("../cache/cacheService");

class ExpenseService {
  async createExpense(data, userId) {
    const expense = await prisma.expense.create({
      data: {
        ...data,
        userId,
        status: "PENDING",
      },
    });

    // Invalidate related caches
    await this.invalidateExpenseCaches(userId);

    return expense;
  }

  async updateExpense(expenseId, data, userId) {
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data,
    });

    // Invalidate related caches
    await this.invalidateExpenseCaches(userId, expenseId);

    return expense;
  }

  async invalidateExpenseCaches(userId, expenseId = null) {
    const patterns = [
      `api:/expenses*:${userId}`,
      `api:/reports/dashboard*:${userId}`,
      `expense:${userId}:*`,
    ];

    if (expenseId) {
      patterns.push(`expense:${expenseId}`);
    }

    await Promise.all(
      patterns.map((pattern) => cacheService.invalidatePattern(pattern))
    );
  }
}
```

### 3.5 Caching Best Practices

**TTL Guidelines**:

- User profile: 1 hour (3600s)
- Expense list: 5 minutes (300s)
- Dashboard stats: 10 minutes (600s)
- Company settings: 1 hour (3600s)
- Approval rules: 30 minutes (1800s)

**Cache Keys Convention**:

```
expensewise:api:/expenses:user_xyz789
expensewise:expense:exp_abc123
expensewise:user:profile:user_xyz789
expensewise:company:settings:comp_abc123
```

---

## 4. File Storage and Management

### 4.1 Storage Architecture

**AWS S3 Bucket Structure**:

```
expensewise-receipts/
├── receipts/
│   ├── {companyId}/
│   │   ├── {year}/
│   │   │   ├── {month}/
│   │   │   │   ├── {receiptId}_original.jpg
│   │   │   │   └── {receiptId}_thumb.jpg
├── exports/
│   ├── {userId}/
│   │   └── report_{timestamp}.xlsx
└── temp/
    └── {sessionId}/
        └── {filename}
```

### 4.2 File Upload Service (Multer + S3)

```javascript
// services/storage/storageService.js
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        userId: req.user.id,
        companyId: req.user.companyId,
        uploadedAt: new Date().toISOString(),
      });
    },
    key: (req, file, cb) => {
      const companyId = req.user.companyId;
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}${ext}`;

      const key = `receipts/${companyId}/${year}/${month}/${filename}`;
      cb(null, key);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
  },
});

class StorageService {
  async generateSignedUrl(key, expiresIn = 3600) {
    return s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    });
  }

  async deleteFile(key) {
    return s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
      .promise();
  }

  async copyFile(sourceKey, destKey) {
    return s3
      .copyObject({
        Bucket: process.env.S3_BUCKET_NAME,
        CopySource: `${process.env.S3_BUCKET_NAME}/${sourceKey}`,
        Key: destKey,
      })
      .promise();
  }
}

module.exports = {
  upload,
  storageService: new StorageService(),
};
```

### 4.3 Receipt Upload Endpoint

```javascript
// routes/receipts.js
const express = require("express");
const { upload } = require("../services/storage/storageService");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: "FILE_REQUIRED",
            message: "No file uploaded",
          },
        });
      }

      // File is already uploaded to S3 by multer-s3
      const receipt = {
        id: `receipt_${Date.now()}`,
        filename: req.file.originalname,
        url: req.file.location,
        key: req.file.key,
        size: req.file.size,
        mimeType: req.file.mimetype,
        status: "PROCESSING",
      };

      // Queue OCR processing
      // ... (see section 2.3)

      res.status(201).json({
        success: true,
        data: receipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: error.message,
        },
      });
    }
  }
);

module.exports = router;
```

---

## 5. OCR Processing Pipeline

### 5.1 OCR Flow Diagram

```
┌─────────────┐
│   Client    │
│  Uploads    │
│   Receipt   │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│  S3 Storage  │
│ (Raw Image)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  OCR Queue   │
│  (Bull/RMQ)  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│       OCR Worker                 │
│                                  │
│  1. Download image from S3       │
│  2. Preprocess (resize, enhance) │
│  3. Run Tesseract OCR            │
│  4. Parse extracted text         │
│  5. Extract structured data      │
│  6. Store results in DB          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │
│ (OCR Data)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Notification│
│   Service    │
└──────────────┘
```

### 5.2 OCR Text Parser

```javascript
// services/ocr/ocrParser.js
class OCRParser {
  parseReceiptText(text) {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      merchantName: this.extractMerchantName(lines),
      totalAmount: this.extractTotalAmount(lines),
      date: this.extractDate(lines),
      lineItems: this.extractLineItems(lines),
      taxAmount: this.extractTax(lines),
      currency: this.extractCurrency(text),
    };
  }

  extractMerchantName(lines) {
    // Merchant name is typically in the first few lines
    const merchantPatterns = [
      /^([A-Z][A-Za-z\s&'-]+)$/,
      /^([A-Z\s]+(?:INC|LLC|LTD|CORP))$/i,
    ];

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      for (const pattern of merchantPatterns) {
        const match = lines[i].match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
    }

    return lines[0] || "Unknown Merchant";
  }

  extractTotalAmount(lines) {
    const amountPatterns = [
      /total[\s:]*\$?(\d+\.\d{2})/i,
      /amount[\s:]*\$?(\d+\.\d{2})/i,
      /\$(\d+\.\d{2})\s*total/i,
    ];

    for (const line of lines.reverse()) {
      for (const pattern of amountPatterns) {
        const match = line.match(pattern);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }

    // Fallback: find largest amount
    const amounts = lines
      .map((line) => line.match(/\$?(\d+\.\d{2})/))
      .filter(Boolean)
      .map((match) => parseFloat(match[1]));

    return amounts.length > 0 ? Math.max(...amounts) : 0;
  }

  extractDate(lines) {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\w+ \d{1,2},? \d{4})/,
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          return new Date(match[1]);
        }
      }
    }

    return new Date();
  }

  extractLineItems(lines) {
    const lineItems = [];
    const itemPattern = /^(.+?)\s+\$?(\d+\.\d{2})$/;

    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match && !line.toLowerCase().includes("total")) {
        lineItems.push({
          description: match[1].trim(),
          amount: parseFloat(match[2]),
        });
      }
    }

    return lineItems;
  }

  extractTax(lines) {
    const taxPattern = /tax[\s:]*\$?(\d+\.\d{2})/i;

    for (const line of lines) {
      const match = line.match(taxPattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return 0;
  }

  extractCurrency(text) {
    if (text.includes("$") || /USD/i.test(text)) return "USD";
    if (text.includes("€") || /EUR/i.test(text)) return "EUR";
    if (text.includes("£") || /GBP/i.test(text)) return "GBP";
    return "USD"; // Default
  }
}

module.exports = new OCRParser();
```

---

## 6. Email and Notification System

### 6.1 Notification Types

- **Expense Submitted**: Notify managers when employee submits expense
- **Expense Approved**: Notify employee when expense is approved
- **Expense Rejected**: Notify employee when expense is rejected
- **Approval Required**: Notify manager when expense needs approval
- **Password Reset**: Send password reset link
- **User Invitation**: Invite new user to company
- **Weekly Summary**: Send weekly expense summary

### 6.2 Email Service Implementation

```javascript
// services/notification/emailService.js
const nodemailer = require("nodemailer");
const { emailQueue } = require("../../queues");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendExpenseApprovedEmail(expense, user) {
    await emailQueue.add("send-email", {
      to: user.email,
      subject: "Your expense has been approved",
      template: "expense-approved",
      data: {
        userName: user.firstName,
        expenseAmount: expense.amount,
        expenseCurrency: expense.currency,
        expenseDescription: expense.description,
        approvedAt: expense.approvedAt,
      },
    });
  }

  async sendExpenseRejectedEmail(expense, user, reason) {
    await emailQueue.add("send-email", {
      to: user.email,
      subject: "Your expense has been rejected",
      template: "expense-rejected",
      data: {
        userName: user.firstName,
        expenseAmount: expense.amount,
        expenseCurrency: expense.currency,
        expenseDescription: expense.description,
        rejectionReason: reason,
      },
    });
  }

  async sendApprovalRequiredEmail(expense, manager) {
    await emailQueue.add("send-email", {
      to: manager.email,
      subject: "New expense requires your approval",
      template: "approval-required",
      data: {
        managerName: manager.firstName,
        employeeName: `${expense.user.firstName} ${expense.user.lastName}`,
        expenseAmount: expense.amount,
        expenseCurrency: expense.currency,
        expenseDescription: expense.description,
        approvalLink: `${process.env.APP_URL}/approvals/${expense.id}`,
      },
    });
  }
}

module.exports = new EmailService();
```

### 6.3 Email Worker

```javascript
// workers/emailWorker.js
const { emailQueue } = require("../queues");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");

// Email templates cache
const templates = new Map();

async function loadTemplate(templateName) {
  if (templates.has(templateName)) {
    return templates.get(templateName);
  }

  const templatePath = path.join(
    __dirname,
    "../templates/emails",
    `${templateName}.hbs`
  );
  const templateContent = await fs.readFile(templatePath, "utf8");
  const compiled = handlebars.compile(templateContent);

  templates.set(templateName, compiled);
  return compiled;
}

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

emailQueue.process("send-email", 10, async (job) => {
  const { to, subject, template, data } = job.data;

  try {
    // Load and compile template
    const templateFn = await loadTemplate(template);
    const html = templateFn(data);

    // Send email
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
});

console.log("Email worker started");
```

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0

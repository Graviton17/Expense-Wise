import { z } from "zod";

// Environment configuration schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Server Configuration
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1000).max(65535))
    .default("3000"),

  // Database Configuration
  DATABASE_URL: z.string().url("Invalid database URL"),
  DATABASE_POOL_SIZE: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default("10"),
  DATABASE_TIMEOUT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1000))
    .default("30000"),

  // Redis Configuration
  REDIS_URL: z.string().url("Invalid Redis URL"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(0).max(15))
    .default("0"),
  REDIS_MAX_RETRIES: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default("3"),

  // JWT Configuration
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT access secret must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT refresh secret must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS Access Key ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS Secret Access Key is required"),
  AWS_REGION: z.string().min(1, "AWS Region is required"),
  AWS_S3_BUCKET: z.string().min(1, "AWS S3 Bucket name is required"),

  // Email Configuration
  SMTP_HOST: z.string().min(1, "SMTP host is required"),
  SMTP_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SMTP_USER: z.string().min(1, "SMTP user is required"),
  SMTP_PASS: z.string().min(1, "SMTP password is required"),
  SMTP_FROM: z.string().email("Invalid SMTP from email"),

  // Application Configuration
  APP_URL: z.string().url("Invalid application URL"),
  CORS_ORIGIN: z.string().default("*"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1000))
    .default("900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default("100"),

  // File Upload Limits
  MAX_FILE_SIZE: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1024))
    .default("10485760"), // 10MB
  ALLOWED_FILE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/jpg,application/pdf"),

  // OCR Service (optional)
  OCR_SERVICE_URL: z.string().url().optional(),
  OCR_SERVICE_API_KEY: z.string().optional(),

  // Webhook Configuration
  WEBHOOK_SECRET: z
    .string()
    .min(16, "Webhook secret must be at least 16 characters")
    .optional(),

  // Monitoring and Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  METRICS_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // External Services (optional)
  SENTRY_DSN: z.string().url().optional(),
  ANALYTICS_ID: z.string().optional(),
});

// Validate and export environment variables
export const env = envSchema.parse(process.env);

// Type for environment configuration
export type EnvConfig = z.infer<typeof envSchema>;

// Helper functions for configuration
export const isDevelopment = () => env.NODE_ENV === "development";
export const isProduction = () => env.NODE_ENV === "production";
export const isTest = () => env.NODE_ENV === "test";

// Database configuration
export const databaseConfig = {
  url: env.DATABASE_URL,
  poolSize: env.DATABASE_POOL_SIZE,
  timeout: env.DATABASE_TIMEOUT,
};

// Redis configuration
export const redisConfig = {
  url: env.REDIS_URL,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  maxRetriesPerRequest: env.REDIS_MAX_RETRIES,
  retryDelayOnFailover: 100,
};

// JWT configuration
export const jwtConfig = {
  accessTokenSecret: env.JWT_ACCESS_SECRET,
  refreshTokenSecret: env.JWT_REFRESH_SECRET,
  accessTokenExpiry: env.JWT_ACCESS_EXPIRES_IN,
  refreshTokenExpiry: env.JWT_REFRESH_EXPIRES_IN,
};

// AWS S3 configuration
export const s3Config = {
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
  bucket: env.AWS_S3_BUCKET,
};

// Email configuration
export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  from: env.SMTP_FROM,
};

// Application configuration
export const appConfig = {
  url: env.APP_URL,
  port: env.PORT,
  corsOrigin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
  fileUpload: {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(",").map((type) => type.trim()),
  },
  ocr: {
    serviceUrl: env.OCR_SERVICE_URL,
    apiKey: env.OCR_SERVICE_API_KEY,
  },
  webhook: {
    secret: env.WEBHOOK_SECRET,
  },
  monitoring: {
    logLevel: env.LOG_LEVEL,
    metricsEnabled: env.METRICS_ENABLED,
    sentryDsn: env.SENTRY_DSN,
    analyticsId: env.ANALYTICS_ID,
  },
};

// Configuration validation function
export function validateConfig(): { valid: boolean; errors: string[] } {
  try {
    envSchema.parse(process.env);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return { valid: false, errors };
    }
    return { valid: false, errors: ["Unknown configuration error"] };
  }
}

// Print configuration summary (for debugging)
export function printConfigSummary(): void {
  if (!isDevelopment()) return;

  console.log("📋 Configuration Summary:");
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Port: ${env.PORT}`);
  console.log(`   Database: ${env.DATABASE_URL.split("@")[1] || "configured"}`);
  console.log(`   Redis: ${env.REDIS_URL.split("@")[1] || "configured"}`);
  console.log(`   S3 Bucket: ${env.AWS_S3_BUCKET}`);
  console.log(`   SMTP Host: ${env.SMTP_HOST}`);
  console.log(`   Log Level: ${env.LOG_LEVEL}`);
  console.log(`   Metrics Enabled: ${env.METRICS_ENABLED}`);
}

// Export all configurations as a single object
export const config = {
  env,
  database: databaseConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  s3: s3Config,
  email: emailConfig,
  app: appConfig,
  isDevelopment,
  isProduction,
  isTest,
  validate: validateConfig,
  printSummary: printConfigSummary,
};

export default config;

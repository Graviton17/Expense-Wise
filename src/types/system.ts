// System and utility types

// JWT Token Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string;
  iat: number;
  exp: number;
  type: "access" | "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Cache Types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

export interface CacheInstance {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

// Email Types
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface EmailContext {
  [key: string]: any;
}

// File Upload Types
export interface FileMetadata {
  originalName: string;
  fileName: string;
  size: number;
  type: string;
  path: string;
  url: string;
}

export interface S3UploadOptions {
  bucket?: string;
  key: string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface S3DownloadOptions {
  bucket?: string;
  key: string;
  expires?: number; // Signed URL expiration in seconds
}

// OCR Types
export interface OCRResult {
  text: string;
  confidence: number;
  fields: {
    merchant?: string;
    amount?: number;
    currency?: string;
    date?: string;
    category?: string;
    taxAmount?: number;
  };
  rawData: any;
}

export interface OCRJobData {
  receiptId: string;
  s3Key: string;
  userId: string;
  expenseId: string;
}

// Queue Types
export interface QueueJob<T = any> {
  id: string;
  data: T;
  opts?: {
    delay?: number;
    attempts?: number;
    priority?: number;
  };
}

export interface EmailJobData {
  to: string | string[];
  template: string;
  context: EmailContext;
  options?: Partial<EmailOptions>;
}

export interface ReportJobData {
  userId: string;
  companyId: string;
  type: "expense" | "approval" | "user";
  format: "csv" | "pdf";
  filters: any;
  email?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Filter Types
export interface DateFilter {
  from?: Date | string;
  to?: Date | string;
}

export interface AmountFilter {
  min?: number;
  max?: number;
}

export interface StatusFilter {
  status?: string | string[];
}

export interface ExpenseFilters {
  userId?: string;
  companyId?: string;
  categoryId?: string;
  status?: string | string[];
  dateRange?: DateFilter;
  amountRange?: AmountFilter;
  search?: string;
}

export interface UserFilters {
  companyId?: string;
  role?: string | string[];
  managerId?: string;
  isActive?: boolean;
  search?: string;
}

// Sorting Types
export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// API Response Wrapper Types
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Metrics Types
export interface MetricLabel {
  [key: string]: string;
}

export interface MetricPoint {
  name: string;
  value: number;
  labels?: MetricLabel;
  timestamp: number;
}

export interface BusinessMetrics {
  expensesCreated: number;
  expensesSubmitted: number;
  expensesApproved: number;
  expensesRejected: number;
  filesUploaded: number;
  usersActive: number;
  totalAmountProcessed: number;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SecurityEvent {
  type:
    | "login"
    | "logout"
    | "password_change"
    | "failed_login"
    | "token_refresh";
  userId?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: any;
  timestamp: Date;
}

// Configuration Types
export interface DatabaseConfig {
  url: string;
  poolSize?: number;
  timeout?: number;
}

export interface RedisConfig {
  url: string;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export interface AppConfig {
  env: "development" | "production" | "test";
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  s3: S3Config;
  email: EmailConfig;
  jwt: JWTConfig;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

// Webhook Types
export interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  companyId: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: "pending" | "success" | "failed";
  attempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  response?: {
    status: number;
    body: string;
    headers: Record<string, string>;
  };
}

// Health Check Types
export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    [service: string]: {
      status: boolean;
      message?: string;
      latency?: number;
    };
  };
  metadata: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    timestamp: string;
    version?: string;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// Type guards
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidCUID(id: string): boolean {
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
}

export function isValidCurrency(currency: string): boolean {
  const validCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "INR",
  ];
  return validCurrencies.includes(currency.toUpperCase());
}

export function isValidRole(role: string): role is keyof typeof UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidExpenseStatus(
  status: string
): status is keyof typeof ExpenseStatus {
  return Object.values(ExpenseStatus).includes(status as ExpenseStatus);
}

// Re-export enums for convenience
export {
  UserRole,
  ExpenseStatus,
  ApprovalStatus,
  NotificationType,
  ReceiptStatus,
  WebhookStatus,
} from "./database";

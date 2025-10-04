// Database Model Types (based on Prisma schema)

// Enums
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum ExpenseStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum NotificationType {
  EXPENSE_SUBMITTED = "EXPENSE_SUBMITTED",
  EXPENSE_APPROVED = "EXPENSE_APPROVED",
  EXPENSE_REJECTED = "EXPENSE_REJECTED",
  APPROVAL_REQUIRED = "APPROVAL_REQUIRED",
  SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
}

export enum ReceiptStatus {
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
}

export enum WebhookStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// Base model interfaces (matching Prisma schema)
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  managerId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  company?: Company;
  manager?: User;
  directReports?: User[];
  expenses?: Expense[];
  approvals?: Approval[];
  receipts?: Receipt[];
  notifications?: Notification[];
}

export interface Company {
  id: string;
  name: string;
  country: string;
  baseCurrency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  users?: User[];
  categories?: Category[];
  expenses?: Expense[];
  webhooks?: Webhook[];
}

export interface Category {
  id: string;
  name: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  company?: Company;
  expenses?: Expense[];
}

export interface Expense {
  id: string;
  userId: string;
  companyId: string;
  categoryId: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  merchantName?: string;
  status: ExpenseStatus;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  company?: Company;
  category?: Category;
  receipts?: Receipt[];
  approvals?: Approval[];
}

export interface Approval {
  id: string;
  expenseId: string;
  approverId: string;
  status: ApprovalStatus;
  comment?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  expense?: Expense;
  approver?: User;
}

export interface Receipt {
  id: string;
  expenseId: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  s3Url: string;
  status: ReceiptStatus;
  ocrData?: any;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  expense?: Expense;
  user?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

export interface Webhook {
  id: string;
  companyId: string;
  url: string;
  events: string[];
  secret: string;
  status: WebhookStatus;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  company?: Company;
}

// Public-facing types (without sensitive fields)
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  company?: CompanyPublic;
  manager?: UserPublic;
  subordinates?: UserPublic[];

  // Optional computed fields
  stats?: {
    totalExpenses?: number;
    subordinates?: number;
  };
}

export interface CompanyPublic {
  id: string;
  name: string;
  country: string;
  baseCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryPublic {
  id: string;
  name: string;
  companyId: string;
  expenseCount?: number; // Optional computed field
}

export interface ExpensePublic {
  id: string;
  userId: string;
  companyId: string;
  categoryId: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  merchantName?: string;
  status: ExpenseStatus;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: UserPublic;
  company?: CompanyPublic;
  category?: CategoryPublic;
  receipts?: ReceiptPublic[];
  approvals?: ApprovalPublic[];
}

export interface ApprovalPublic {
  id: string;
  expenseId: string;
  approverId: string;
  status: ApprovalStatus;
  comment?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  expense?: ExpensePublic;
  approver?: UserPublic;
}

export interface ReceiptPublic {
  id: string;
  expenseId: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  s3Url: string;
  status: ReceiptStatus;
  ocrData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPublic {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookPublic {
  id: string;
  companyId: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Database query options
export interface FindManyOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, "asc" | "desc">;
  where?: Record<string, any>;
  include?: Record<string, boolean | object>;
  select?: Record<string, boolean>;
}

export interface FindUniqueOptions {
  where: Record<string, any>;
  include?: Record<string, boolean | object>;
  select?: Record<string, boolean>;
}

// Aggregation types
export interface ExpenseAggregation {
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  count: number;
}

export interface CategoryExpenseStats {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  count: number;
  avgAmount: number;
}

export interface MonthlyExpenseStats {
  year: number;
  month: number;
  totalAmount: number;
  count: number;
  avgAmount: number;
}

export interface UserExpenseStats {
  userId: string;
  firstName: string;
  lastName: string;
  totalAmount: number;
  count: number;
  avgAmount: number;
}

// Prisma-specific types for type safety
export type UserCreateInput = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UserUpdateInput = Partial<
  Omit<User, "id" | "createdAt" | "updatedAt">
>;

export type CompanyCreateInput = Omit<
  Company,
  "id" | "createdAt" | "updatedAt"
>;
export type CompanyUpdateInput = Partial<
  Omit<Company, "id" | "createdAt" | "updatedAt">
>;

export type CategoryCreateInput = Omit<
  Category,
  "id" | "createdAt" | "updatedAt"
>;
export type CategoryUpdateInput = Partial<
  Omit<Category, "id" | "createdAt" | "updatedAt">
>;

export type ExpenseCreateInput = Omit<
  Expense,
  "id" | "createdAt" | "updatedAt"
>;
export type ExpenseUpdateInput = Partial<
  Omit<Expense, "id" | "createdAt" | "updatedAt">
>;

export type ApprovalCreateInput = Omit<
  Approval,
  "id" | "createdAt" | "updatedAt"
>;
export type ApprovalUpdateInput = Partial<
  Omit<Approval, "id" | "createdAt" | "updatedAt">
>;

export type ReceiptCreateInput = Omit<
  Receipt,
  "id" | "createdAt" | "updatedAt"
>;
export type ReceiptUpdateInput = Partial<
  Omit<Receipt, "id" | "createdAt" | "updatedAt">
>;

export type NotificationCreateInput = Omit<
  Notification,
  "id" | "createdAt" | "updatedAt"
>;
export type NotificationUpdateInput = Partial<
  Omit<Notification, "id" | "createdAt" | "updatedAt">
>;

export type WebhookCreateInput = Omit<
  Webhook,
  "id" | "createdAt" | "updatedAt"
>;
export type WebhookUpdateInput = Partial<
  Omit<Webhook, "id" | "createdAt" | "updatedAt">
>;

// Report-related types and enums
export enum ReportFormat {
  JSON = "json",
  CSV = "csv",
  XLSX = "xlsx",
  PDF = "pdf",
}

export enum ReportPeriod {
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

export enum ExportTaskStatus {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Report data structures
export interface ReportSummary {
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
}

export interface StatusBreakdown {
  status: ExpenseStatus;
  count: number;
  amount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  count: number;
  amount: number;
}

export interface MonthlyTrend {
  month: Date;
  count: number;
  total: number;
}

export interface TopSpender {
  id: string;
  name: string;
  email: string;
  expenseCount: number;
  totalAmount: number;
}

export interface DashboardAnalytics {
  summary: ReportSummary;
  statusBreakdown: StatusBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
  topSpenders: TopSpender[];
  period: {
    startDate: string;
    endDate: string;
    type: ReportPeriod;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ExpenseReportFilters {
  startDate?: string;
  endDate?: string;
  status?: ExpenseStatus;
  categoryId?: string;
  userId?: string;
}

export interface ExpenseReport {
  expenses: Expense[];
  pagination: PaginationInfo;
  filters: ExpenseReportFilters;
}

export interface ExportTask {
  taskId: string;
  status: ExportTaskStatus;
  format: ReportFormat;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
  message?: string;
}

export interface SummaryStats {
  period: {
    startDate: string;
    endDate: string;
    type: ReportPeriod;
  };
  summary: {
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    maxAmount: number;
    minAmount: number;
  };
}

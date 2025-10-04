// API Request and Response Types

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
}

export interface AuthResponse {
  user: UserPublic;
  tokens: TokenResponse;
}

// User Types
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  managerId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  managerId?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Company Types
export interface CreateCompanyRequest {
  name: string;
  country: string;
  baseCurrency: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  country?: string;
  baseCurrency?: string;
}

// Expense Types
export interface CreateExpenseRequest {
  categoryId: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  merchantName?: string;
}

export interface UpdateExpenseRequest {
  categoryId?: string;
  amount?: number;
  currency?: string;
  description?: string;
  date?: string;
  merchantName?: string;
}

export interface SubmitExpenseRequest {
  comment?: string;
}

// Approval Types
export interface ApproveExpenseRequest {
  comment?: string;
}

export interface RejectExpenseRequest {
  comment: string;
}

// Category Types
export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}

// Receipt Types
export interface UploadReceiptRequest {
  expenseId: string;
}

// Report Types
export interface GenerateReportRequest {
  startDate: string;
  endDate: string;
  userId?: string;
  format?: "json" | "csv" | "pdf";
}

// Webhook Types
export interface CreateWebhookRequest {
  url: string;
  events: string[];
  secret: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  secret?: string;
}

// Query Parameter Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface UsersQuery extends PaginationQuery {
  role?: UserRole;
  search?: string;
}

export interface ExpensesQuery extends PaginationQuery {
  status?: ExpenseStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ApprovalsQuery extends PaginationQuery {
  status?: ApprovalStatus;
  approverId?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationsQuery extends PaginationQuery {
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface ReportsQuery extends PaginationQuery {
  type?: string;
  startDate?: string;
  endDate?: string;
}

// Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    database: boolean;
    redis: boolean;
    fileStorage: boolean;
  };
  metrics: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    timestamp: string;
  };
}

// Metrics Types
export interface MetricsResponse {
  metrics: string; // Prometheus format
}

// Statistics Types
export interface ExpenseStatsResponse {
  totalAmount: number;
  totalCount: number;
  avgAmount: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    count: number;
  }[];
  byStatus: {
    status: ExpenseStatus;
    totalAmount: number;
    count: number;
  }[];
  byMonth: {
    month: string;
    totalAmount: number;
    count: number;
  }[];
}

export interface CompanyStatsResponse {
  totalUsers: number;
  totalExpenses: number;
  totalAmount: number;
  pendingApprovals: number;
  monthlyStats: {
    month: string;
    expenses: number;
    amount: number;
    users: number;
  }[];
}

// File Upload Types
export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

// Bulk Operations Types
export interface BulkApproveRequest {
  expenseIds: string[];
  comment?: string;
}

export interface BulkRejectRequest {
  expenseIds: string[];
  comment: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkOperationResponse {
  processed: number;
  succeeded: number;
  failed: number;
  errors: {
    id: string;
    error: string;
  }[];
}

// Webhook Payload Types
export interface WebhookExpensePayload {
  event:
    | "expense.created"
    | "expense.updated"
    | "expense.deleted"
    | "expense.submitted";
  data: ExpensePublic;
  timestamp: string;
  companyId: string;
}

export interface WebhookApprovalPayload {
  event: "approval.created" | "approval.approved" | "approval.rejected";
  data: ApprovalPublic;
  timestamp: string;
  companyId: string;
}

export interface WebhookUserPayload {
  event: "user.created" | "user.updated" | "user.deleted";
  data: UserPublic;
  timestamp: string;
  companyId: string;
}

// Import base types from database models
export type {
  UserRole,
  ExpenseStatus,
  ApprovalStatus,
  NotificationType,
  UserPublic,
  ExpensePublic,
  ApprovalPublic,
  CompanyPublic,
  CategoryPublic,
  ReceiptPublic,
  NotificationPublic,
} from "./database";

// Type definitions for the Expense Management System

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE";
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  country: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  companyId: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  receipts: Receipt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  expenseId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  ocrData?: OCRData;
  createdAt: Date;
}

export interface OCRData {
  merchantName?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  category?: string;
  confidence: number;
}

export interface ApprovalWorkflow {
  id: string;
  companyId: string;
  name: string;
  rules: ApprovalRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRule {
  id: string;
  workflowId: string;
  condition: "AMOUNT_THRESHOLD" | "CATEGORY" | "USER_ROLE";
  value: string | number;
  approverRole: "MANAGER" | "ADMIN";
  isRequired: boolean;
  order: number;
}

// Form types
export interface CompanySignupFormData {
  companyName: string;
  address: string;
  country: string;
  currency: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UserSigninFormData {
  email: string;
  password: string;
}

export interface ExpenseFormData {
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: Date;
  receipts: File[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// State types
export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ExpenseFilters {
  status?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  search?: string;
}

// Component prop types
export interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: User["role"];
  userName?: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

// Type definitions for ExpenseWise - matching Prisma schema

// Enums from Prisma schema
export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type ExpenseStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

// Core entities matching Prisma models
export interface Company {
  id: string;
  name: string;
  country: string;
  baseCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Optional for frontend use
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  managerId?: string;
  
  // Relations
  company?: Company;
  manager?: User;
  subordinates?: User[];
  submittedExpenses?: Expense[];
  ruleAssignments?: RuleApprover[];
  approvalActions?: ExpenseApproval[];
  
  // UI-specific fields
  avatar?: string;
  initials?: string;
  status?: "active" | "inactive";
  lastActiveAt?: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  companyId: string;
  
  // Relations
  company?: Company;
  expenses?: Expense[];
  
  // UI-specific fields
  color?: string;
  expenseCount?: number;
}

export interface Expense {
  id: string;
  description: string;
  expenseDate: Date;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
  submitterId: string;
  companyId: string;
  categoryId: string;
  
  // Relations
  submitter?: User;
  company?: Company;
  category?: ExpenseCategory;
  receipt?: Receipt;
  approvals?: ExpenseApproval[];
  
  // UI-specific fields
  convertedAmount?: number;
  exchangeRate?: number;
  priority?: "urgent" | "high" | "normal" | "low";
  currentApprover?: User;
  isProcessing?: boolean;
}

export interface Receipt {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  expenseId: string;
  
  // Relations
  expense?: Expense;
  
  // UI-specific fields
  thumbnailUrl?: string;
  fileSize?: string;
  ocrData?: OCRResults;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  isManagerApprovalRequired: boolean;
  isSequenceRequired: boolean;
  minApprovalPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  
  // Relations
  company?: Company;
  approvers?: RuleApprover[];
}

export interface RuleApprover {
  id: string;
  sequenceOrder?: number;
  isRequired: boolean;
  ruleId: string;
  approverId: string;
  
  // Relations
  approvalRule?: ApprovalRule;
  approver?: User;
  
  // UI-specific fields
  user?: User;
}

export interface ExpenseApproval {
  id: string;
  status: ApprovalStatus;
  comments?: string;
  processedAt?: Date;
  expenseId: string;
  approverId: string;
  
  // Relations
  expense?: Expense;
  approver?: User;
}

// OCR-related types
export interface OCRResults {
  confidence: number;
  description?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  vendor?: string;
  category?: string;
  extractedText: string;
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

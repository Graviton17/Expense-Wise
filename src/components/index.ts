// Component exports for easy importing

// Forms
export { default as CompanySignupForm } from "./forms/company-signup-form";
export { default as UserSigninForm } from "./forms/user-signin-form";
export { default as ExpenseSubmissionForm } from "./forms/expense-submission-form";

// Layout
export { default as DashboardLayout } from "./layout/dashboard-layout";
export { default as AuthLayout } from "./layout/auth-layout";

// Shared Components
export { default as StatusBadge } from "./shared/status-badge";
export { default as CurrencyDisplay } from "./shared/currency-display";

// Dashboard Components - Admin
export { default as UserManagementTable } from "./dashboard/admin/user-management-table";
export { default as ApprovalRuleEditor } from "./dashboard/admin/approval-rule-editor";

// Dashboard Components - Employee
export { default as ExpenseHistoryTable } from "./dashboard/employee/expense-history-table";

// Dashboard Components - Manager
export { default as PendingApprovalsTable } from "./dashboard/manager/pending-approvals-table";

// Expense Components
export { default as ReceiptUpload } from "./expense/receipt-upload";

// Re-export UI components for convenience
export * from "./ui/button";
export * from "./ui/input";
export * from "./ui/label";
export * from "./ui/card";
export * from "./ui/table";
export * from "./ui/badge";
export * from "./ui/avatar";
export * from "./ui/select";
export * from "./ui/dialog";
export * from "./ui/form";
export * from "./ui/calendar";
export * from "./ui/progress";
export * from "./ui/skeleton";
export * from "./ui/tabs";
export * from "./ui/separator";
export * from "./ui/dropdown-menu";
export * from "./ui/checkbox";
export * from "./ui/switch";
export * from "./ui/textarea";
export * from "./ui/tooltip";
export * from "./ui/popover";
export * from "./ui/alert";
export * from "./ui/breadcrumb";
export * from "./ui/pagination";
export * from "./ui/sonner";

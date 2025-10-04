"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  AlertCircle 
} from "lucide-react";
import type { ExpenseStatus, ApprovalStatus } from "@/types";

interface StatusBadgeProps {
  status: ExpenseStatus | ApprovalStatus | string;
  variant?: "default" | "compact";
  className?: string;
}

export function StatusBadge({ 
  status, 
  variant = "default", 
  className 
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    
    switch (normalizedStatus) {
      case "APPROVED":
        return {
          label: "Approved",
          icon: CheckCircle,
          className: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-sm",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          icon: XCircle,
          className: "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 shadow-sm",
        };
      case "PENDING":
      case "PENDING_APPROVAL":
        return {
          label: "Pending",
          icon: Clock,
          className: "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200 shadow-sm",
        };
      case "DRAFT":
        return {
          label: "Draft",
          icon: FileText,
          className: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-sm",
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-sm",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (variant === "compact") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-medium border",
          config.className,
          className
        )}
      >
        <Icon className="h-2.5 w-2.5 mr-1" />
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Specialized expense status badge with approval progress
interface ExpenseStatusBadgeProps {
  expense: {
    status: ExpenseStatus;
    approvals?: Array<{
      id: string;
      status: ApprovalStatus;
      approver: {
        name: string;
      };
    }>;
    currentApprover?: {
      name: string;
    };
  };
  showProgress?: boolean;
  className?: string;
}

export function ExpenseStatusBadge({ 
  expense, 
  showProgress = false, 
  className 
}: ExpenseStatusBadgeProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <StatusBadge status={expense.status} />
      
      {showProgress && expense.status === "PENDING_APPROVAL" && expense.approvals && (
        <ApprovalProgress 
          approvals={expense.approvals}
          currentApprover={expense.currentApprover}
        />
      )}
    </div>
  );
}

// Approval progress indicator
interface ApprovalProgressProps {
  approvals: Array<{
    id: string;
    status: ApprovalStatus;
    approver: {
      name: string;
    };
  }>;
  currentApprover?: {
    name: string;
  };
}

function ApprovalProgress({ approvals, currentApprover }: ApprovalProgressProps) {
  return (
    <div className="space-y-1">
      {currentApprover && (
        <div className="flex items-center text-xs text-gray-600">
          <Clock className="h-3 w-3 mr-1" />
          With {currentApprover.name}
        </div>
      )}
      
      <div className="flex items-center space-x-1">
        {approvals.map((approval, index) => (
          <div
            key={approval.id}
            className={cn(
              "h-1.5 w-4 rounded-full transition-colors",
              approval.status === "APPROVED" && "bg-green-500",
              approval.status === "REJECTED" && "bg-red-500",
              approval.status === "PENDING" && index === 0 && "bg-orange-500",
              approval.status === "PENDING" && index !== 0 && "bg-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
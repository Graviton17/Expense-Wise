import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/status-badge";
import CurrencyDisplay from "@/components/shared/currency-display";

interface ExpenseItem {
  id: string;
  employeeName: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  submittedAt: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface PendingApprovalsTableProps {
  expenses: ExpenseItem[];
  onApprove?: (expenseId: string) => void;
  onReject?: (expenseId: string) => void;
  onViewDetails?: (expenseId: string) => void;
  isLoading?: boolean;
}

const PendingApprovalsTable: FC<PendingApprovalsTableProps> = ({
  expenses,
  onApprove,
  onReject,
  onViewDetails,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
        <p className="text-sm text-gray-500">
          Review and approve expense reports
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">
                {expense.employeeName}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>
                <CurrencyDisplay
                  amount={expense.amount}
                  currency={expense.currency}
                />
              </TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>
                <StatusBadge status={expense.status} />
              </TableCell>
              <TableCell>{expense.submittedAt.toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails?.(expense.id)}
                  >
                    View
                  </Button>
                  {expense.status === "PENDING" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onApprove?.(expense.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onReject?.(expense.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingApprovalsTable;
export type { ExpenseItem };

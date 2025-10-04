import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Download } from "lucide-react";
import StatusBadge from "@/components/shared/status-badge";
import CurrencyDisplay from "@/components/shared/currency-display";

interface ExpenseHistoryItem {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  receiptCount: number;
}

interface ExpenseHistoryTableProps {
  expenses: ExpenseHistoryItem[];
  onViewExpense?: (expenseId: string) => void;
  onEditExpense?: (expenseId: string) => void;
  onDownloadReceipt?: (expenseId: string) => void;
  isLoading?: boolean;
}

const ExpenseHistoryTable: FC<ExpenseHistoryTableProps> = ({
  expenses,
  onViewExpense,
  onEditExpense,
  onDownloadReceipt,
  isLoading = false,
}) => {
  const getStatusDate = (expense: ExpenseHistoryItem) => {
    switch (expense.status) {
      case "APPROVED":
        return expense.approvedAt
          ? ` on ${expense.approvedAt.toLocaleDateString()}`
          : "";
      case "REJECTED":
        return expense.rejectedAt
          ? ` on ${expense.rejectedAt.toLocaleDateString()}`
          : "";
      case "PAID":
        return expense.approvedAt
          ? ` on ${expense.approvedAt.toLocaleDateString()}`
          : "";
      default:
        return ` on ${expense.submittedAt.toLocaleDateString()}`;
    }
  };

  const getTotalStats = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pending = expenses.filter((e) => e.status === "PENDING").length;
    const approved = expenses.filter(
      (e) => e.status === "APPROVED" || e.status === "PAID"
    ).length;
    const rejected = expenses.filter((e) => e.status === "REJECTED").length;

    return { total, pending, approved, rejected };
  };

  const stats = getTotalStats();
  const currency = expenses.length > 0 ? expenses[0].currency : "USD";

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense History & Tracking</CardTitle>
        <p className="text-sm text-gray-600">
          Track the status and details of all your submitted expenses
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-900">
              Total Expenses
            </div>
            <div className="text-lg font-bold text-blue-700">
              <CurrencyDisplay amount={stats.total} currency={currency} />
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-yellow-900">Pending</div>
            <div className="text-lg font-bold text-yellow-700">
              {stats.pending}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-900">Approved</div>
            <div className="text-lg font-bold text-green-700">
              {stats.approved}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-red-900">Rejected</div>
            <div className="text-lg font-bold text-red-700">
              {stats.rejected}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg font-medium mb-2">
              No expenses submitted yet
            </div>
            <p className="text-sm">
              Start by submitting your first expense report
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Receipts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-gray-500">
                      Submitted {expense.submittedAt.toLocaleDateString()}
                    </div>
                  </TableCell>

                  <TableCell>
                    <CurrencyDisplay
                      amount={expense.amount}
                      currency={expense.currency}
                    />
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <StatusBadge status={expense.status} />
                      <div className="text-xs text-gray-500">
                        {getStatusDate(expense)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {expense.submittedAt.toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        {expense.receiptCount} file
                        {expense.receiptCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewExpense?.(expense.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {expense.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditExpense?.(expense.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {expense.receiptCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownloadReceipt?.(expense.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseHistoryTable;
export type { ExpenseHistoryItem };

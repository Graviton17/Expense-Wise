import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseHistoryTable from "@/components/dashboard/employee/expense-history-table";
import ExpenseSubmissionForm from "@/components/forms/expense-submission-form";
import ReceiptUpload from "@/components/expense/receipt-upload";

export const metadata: Metadata = {
  title: "Employee Dashboard - Expense Wise",
  description: "Submit and track your expense reports",
};

// Mock data - replace with actual API calls
const mockExpenses = [
  {
    id: "1",
    description: "Business lunch with client",
    amount: 85.5,
    currency: "USD",
    category: "Meals",
    status: "APPROVED" as const,
    submittedAt: new Date("2024-01-15"),
    approvedAt: new Date("2024-01-16"),
    receiptCount: 1,
  },
  {
    id: "2",
    description: "Flight to conference",
    amount: 450.0,
    currency: "USD",
    category: "Travel",
    status: "PENDING" as const,
    submittedAt: new Date("2024-01-20"),
    receiptCount: 2,
  },
  {
    id: "3",
    description: "Office supplies",
    amount: 25.99,
    currency: "USD",
    category: "Office",
    status: "REJECTED" as const,
    submittedAt: new Date("2024-01-10"),
    rejectedAt: new Date("2024-01-12"),
    receiptCount: 1,
  },
];

export default function EmployeeDashboard() {
  const handleViewExpense = (expenseId: string) => {
    console.log("View expense:", expenseId);
    // Implement view expense logic
  };

  const handleEditExpense = (expenseId: string) => {
    console.log("Edit expense:", expenseId);
    // Implement edit expense logic
  };

  const handleDownloadReceipt = (expenseId: string) => {
    console.log("Download receipt:", expenseId);
    // Implement download receipt logic
  };

  const handleSubmitExpense = (data: {
    amount: number;
    category: string;
    description: string;
    date: Date;
    receipts: File[];
  }) => {
    console.log("Submit expense:", data);
    // Implement submit expense logic
  };

  const handleReceiptUpload = (files: File[]) => {
    console.log("Upload receipts:", files);
    // Implement receipt upload logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Employee Dashboard
            </h1>
            <p className="text-gray-600">Submit and track your expenses</p>
          </div>

          {/* Employee Dashboard Tabs */}
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Expense History</TabsTrigger>
              <TabsTrigger value="submit">Submit Expense</TabsTrigger>
              <TabsTrigger value="receipts">Upload Receipts</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-6">
              <ExpenseHistoryTable
                expenses={mockExpenses}
                onViewExpense={handleViewExpense}
                onEditExpense={handleEditExpense}
                onDownloadReceipt={handleDownloadReceipt}
              />
            </TabsContent>

            <TabsContent value="submit" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <ExpenseSubmissionForm onSubmit={handleSubmitExpense} />
              </div>
            </TabsContent>

            <TabsContent value="receipts" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <ReceiptUpload onFilesAccepted={handleReceiptUpload} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Download,
  FileText,
  Eye,
  Edit,
  Send,
  Copy,
  Trash,
  MoreHorizontal,
  ArrowUpDown,
  User,
  TrendingUp,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import { ExpenseSubmitModal } from "@/components/employee/expense-submit-modal";

// Mock data
const mockUser = {
  id: "1",
  name: "John Employee",
  email: "employee@company.com",
  role: "EMPLOYEE" as const,
  avatar: undefined,
};

const mockCompany = {
  name: "Acme Corporation",
  baseCurrency: "USD",
};

const mockExpenses = [
  {
    id: "1",
    description: "Flight to NYC for client meeting",
    expenseDate: new Date("2024-01-15"),
    amount: 500.00,
    currency: "USD",
    status: "PENDING_APPROVAL",
    category: { id: "1", name: "Travel" },
    receipt: { url: "/placeholder-receipt.jpg", fileName: "receipt.jpg", fileType: "image/jpeg" },
    createdAt: new Date("2024-01-15"),
    approvals: [
      { id: "1", status: "APPROVED", approver: { name: "Sarah Manager", role: "MANAGER" }, processedAt: new Date("2024-01-16") },
      { id: "2", status: "PENDING", approver: { name: "Finance Team", role: "ADMIN" }, processedAt: null },
    ],
    currentApprover: { name: "Finance Team" },
  },
  {
    id: "2",
    description: "Team lunch at Italian restaurant",
    expenseDate: new Date("2024-01-14"),
    amount: 120.00,
    currency: "USD",
    status: "APPROVED",
    category: { id: "2", name: "Meals & Entertainment" },
    receipt: { url: "/placeholder-receipt.jpg", fileName: "lunch.jpg", fileType: "image/jpeg" },
    createdAt: new Date("2024-01-14"),
    approvals: [
      { id: "3", status: "APPROVED", approver: { name: "Sarah Manager", role: "MANAGER" }, processedAt: new Date("2024-01-15") },
    ],
  },
  {
    id: "3",
    description: "Personal software subscription",
    expenseDate: new Date("2024-01-12"),
    amount: 99.00,
    currency: "USD",
    status: "REJECTED",
    category: { id: "3", name: "Software" },
    receipt: null,
    createdAt: new Date("2024-01-12"),
    remarks: "Not business related",
    approvals: [
      { id: "4", status: "REJECTED", approver: { name: "Sarah Manager", role: "MANAGER" }, processedAt: new Date("2024-01-13"), comments: "Not business related" },
    ],
  },
  {
    id: "4",
    description: "Office supplies - pens and notebooks",
    expenseDate: new Date("2024-01-16"),
    amount: 45.00,
    currency: "USD",
    status: "DRAFT",
    category: { id: "4", name: "Office Supplies" },
    receipt: null,
    createdAt: new Date("2024-01-16"),
    approvals: [],
  },
];

const mockStats = {
  monthlyTotal: 764.00,
  pendingCount: 1,
  approvedCount: 1,
  rejectedCount: 1,
};

export default function EmployeeDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout user={mockUser} company={mockCompany}>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Page Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                My Expenses
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage your expense submissions
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Expense
            </Button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(mockStats.monthlyTotal, mockCompany.baseCurrency)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{mockStats.pendingCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{mockStats.approvedCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{mockStats.rejectedCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expense History Table */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Expense History
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Track all your submitted expenses and their approval status
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search expenses..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[120px]">Receipt</TableHead>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center space-x-2">
                      <span>Description</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span>Date</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span>Amount</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                  <TableHead className="w-[120px]">Submitted</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <ExpenseTableRow key={expense.id} expense={expense} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Expense Submit Modal */}
      <ExpenseSubmitModal 
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        baseCurrency={mockCompany.baseCurrency}
      />
    </DashboardLayout>
  );
}

function ExpenseTableRow({ expense }: { expense: any }) {
  return (
    <TableRow className="hover:bg-gray-50">
      {/* Receipt Thumbnail */}
      <TableCell>
        {expense.receipt ? (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expense.receipt.url}
              alt="Receipt"
              className="h-14 w-14 object-cover rounded-lg border border-gray-200"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
              <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div className="h-14 w-14 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </TableCell>

      {/* Description */}
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{expense.description}</div>
          {expense.remarks && (
            <div className="text-sm text-gray-500 mt-1">{expense.remarks}</div>
          )}
        </div>
      </TableCell>

      {/* Expense Date */}
      <TableCell>
        <div className="text-sm text-gray-900">
          {formatDate(expense.expenseDate)}
        </div>
      </TableCell>

      {/* Category */}
      <TableCell>
        <Badge variant="outline" className="text-xs font-medium">
          {expense.category.name}
        </Badge>
      </TableCell>

      {/* Amount */}
      <TableCell>
        <div className="font-semibold text-gray-900">
          {formatCurrency(expense.amount, expense.currency)}
        </div>
      </TableCell>

      {/* Status with Approval Progress */}
      <TableCell>
        <div className="space-y-2">
          <ExpenseStatusBadge status={expense.status} />
          {expense.status === "PENDING_APPROVAL" && expense.currentApprover && (
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              With {expense.currentApprover.name}
            </div>
          )}
        </div>
      </TableCell>

      {/* Submitted Date */}
      <TableCell>
        <div className="text-sm text-gray-500">
          {formatRelativeTime(expense.createdAt)}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {expense.status === "DRAFT" && (
              <>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            {expense.status === "DRAFT" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function ExpenseStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    DRAFT: {
      label: "Draft",
      icon: FileText,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    PENDING_APPROVAL: {
      label: "Pending",
      icon: Clock,
      className: "bg-orange-100 text-orange-800 border-orange-200",
    },
    APPROVED: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    REJECTED: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center w-fit space-x-1", config.className)}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

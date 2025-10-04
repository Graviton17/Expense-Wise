"use client";

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
  Filter,
  Bell,
  Settings,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatCurrency, formatDate, formatRelativeTime, getUserInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ExpenseSubmitModal } from "@/components/employee/expense-submit-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to open new expense modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsSubmitModalOpen(true);
      }
      // Ctrl/Cmd + R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log("Refreshing expenses...");
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExport = () => {
    console.log("Exporting expenses...");
    // Export logic here
  };

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let aValue = a[sortField as keyof typeof a];
    let bValue = b[sortField as keyof typeof b];
    
    if (sortField === "amount") {
      aValue = a.amount;
      bValue = b.amount;
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const paginatedExpenses = sortedExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ExpenseWise
                </h1>
                <p className="text-xs text-gray-500">{mockCompany.name}</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Currency Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <span className="text-sm font-semibold text-blue-700">{mockCompany.baseCurrency}</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                        {getUserInitials(mockUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{mockUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{mockUser.name}</p>
                    <p className="text-xs text-gray-500">{mockUser.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                My Expenses
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                Track and manage your expense submissions
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Expense
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new expense (Ctrl+N)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* This Month Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockStats.monthlyTotal, mockCompany.baseCurrency)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{mockStats.pendingCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{mockStats.approvedCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rejected Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{mockStats.rejectedCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expense History Table */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Expense History
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Track all your submitted expenses and their approval status
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search expenses..."
                    className="pl-10 w-full sm:w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 border-gray-300">
                    <Filter className="h-4 w-4 mr-2" />
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-300 hover:bg-gray-50"
                        onClick={handleExport}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export expenses to CSV</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-300 hover:bg-gray-50"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh (Ctrl+R)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 hover:bg-gray-50">
                    <TableHead className="w-[100px] font-semibold text-gray-700">Receipt</TableHead>
                    <TableHead className="w-[250px] font-semibold text-gray-700">
                      <div className="flex items-center space-x-2">
                        <span>Description</span>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-gray-200">
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-700">
                      <div className="flex items-center space-x-2">
                        <span>Date</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 hover:bg-gray-200"
                          onClick={() => handleSort("expenseDate")}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px] font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-700">
                      <div className="flex items-center space-x-2">
                        <span>Amount</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 hover:bg-gray-200"
                          onClick={() => handleSort("amount")}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="w-[180px] font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-700">Submitted</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <ExpenseTableRow key={expense.id} expense={expense} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Expense Submit Modal */}
      <ExpenseSubmitModal 
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        baseCurrency={mockCompany.baseCurrency}
      />
    </div>
  );
}

function ExpenseTableRow({ expense }: { expense: any }) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewDetails = () => {
    setIsViewModalOpen(true);
    console.log("Viewing expense:", expense.id);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    console.log("Editing expense:", expense.id);
  };

  const handleSubmitForApproval = () => {
    console.log("Submitting expense for approval:", expense.id);
    // Show success toast
    alert(`Expense "${expense.description}" submitted for approval!`);
  };

  const handleDuplicate = () => {
    console.log("Duplicating expense:", expense.id);
    alert(`Expense duplicated! You can now edit the copy.`);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log("Deleting expense:", expense.id);
    alert(`Expense "${expense.description}" deleted successfully!`);
    setIsDeleteDialogOpen(false);
  };

  const handleDownloadReceipt = () => {
    console.log("Downloading receipt for expense:", expense.id);
    // Simulate download
    const link = document.createElement('a');
    link.href = expense.receipt?.url || '';
    link.download = expense.receipt?.fileName || 'receipt.jpg';
    link.click();
  };

  return (
    <TableRow className="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-100">
      {/* Receipt Thumbnail */}
      <TableCell className="py-4">
        {expense.receipt ? (
          <div className="relative group">
            <button onClick={handleViewDetails} className="focus:outline-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={expense.receipt.url}
                alt="Receipt"
                className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-200 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </TableCell>

      {/* Description */}
      <TableCell className="py-4">
        <div>
          <div className="font-semibold text-gray-900 text-sm">{expense.description}</div>
          {expense.remarks && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{expense.remarks}</div>
          )}
        </div>
      </TableCell>

      {/* Expense Date */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-700 font-medium">
          {formatDate(expense.expenseDate)}
        </div>
      </TableCell>

      {/* Category */}
      <TableCell className="py-4">
        <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50">
          {expense.category.name}
        </Badge>
      </TableCell>

      {/* Amount */}
      <TableCell className="py-4">
        <div className="font-bold text-gray-900 text-sm">
          {formatCurrency(expense.amount, expense.currency)}
        </div>
      </TableCell>

      {/* Status with Approval Progress */}
      <TableCell className="py-4">
        <div className="space-y-2">
          <ExpenseStatusBadge status={expense.status} />
          {expense.status === "PENDING_APPROVAL" && expense.currentApprover && (
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              <span className="truncate">With {expense.currentApprover.name}</span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Submitted Date */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-500">
          {formatRelativeTime(expense.createdAt)}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer" onClick={handleViewDetails}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {expense.receipt && (
              <DropdownMenuItem className="cursor-pointer" onClick={handleDownloadReceipt}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </DropdownMenuItem>
            )}
            {expense.status === "DRAFT" && (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleSubmitForApproval}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem className="cursor-pointer" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            {expense.status === "DRAFT" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                  onClick={handleDelete}
                >
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
      className: "bg-gray-100 text-gray-800 border-gray-300",
    },
    PENDING_APPROVAL: {
      label: "Pending",
      icon: Clock,
      className: "bg-orange-100 text-orange-800 border-orange-300",
    },
    APPROVED: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 border-green-300",
    },
    REJECTED: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center w-fit space-x-1 font-semibold", config.className)}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

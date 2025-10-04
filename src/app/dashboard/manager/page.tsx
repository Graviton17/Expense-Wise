"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Download,
  FileText,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  User,
  TrendingUp,
  Filter,
  Bell,
  Settings,
  LogOut,
  Check,
  X,
  Users,
  Timer,
  RefreshCw,
  MessageSquare,
  Info,
  Forward,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatCurrency, formatDate, formatRelativeTime, getUserInitials } from "@/lib/utils";
import { useState } from "react";

// Mock data
const mockUser = {
  id: "1",
  name: "Sarah Manager",
  email: "manager@company.com",
  role: "MANAGER" as const,
  avatar: undefined,
};

const mockCompany = {
  name: "Acme Corporation",
  baseCurrency: "USD",
};

const mockPendingExpenses = [
  {
    id: "1",
    description: "Client dinner at Italian restaurant",
    expenseDate: new Date("2024-01-15"),
    amount: 250.00,
    currency: "USD",
    convertedAmount: 250.00,
    exchangeRate: 1.0,
    category: { id: "1", name: "Meals & Entertainment" },
    receipt: { url: "/placeholder-receipt.jpg", fileName: "receipt.jpg", fileType: "image/jpeg" },
    createdAt: new Date("2024-01-15"),
    submitter: { id: "3", name: "Mike Employee", role: "Employee", avatar: undefined, initials: "ME" },
    priority: "normal",
    remarks: "Discussed Q1 strategy with client",
  },
  {
    id: "2",
    description: "Flight to NYC for conference",
    expenseDate: new Date("2024-01-14"),
    amount: 450.00,
    currency: "USD",
    convertedAmount: 450.00,
    exchangeRate: 1.0,
    category: { id: "2", name: "Travel" },
    receipt: { url: "/placeholder-receipt.jpg", fileName: "flight.pdf", fileType: "application/pdf" },
    createdAt: new Date("2024-01-14"),
    submitter: { id: "4", name: "Jane Smith", role: "Employee", avatar: undefined, initials: "JS" },
    priority: "urgent",
  },
];

const mockStats = {
  pendingCount: 2,
  pendingAmount: 700.00,
  monthlyApprovedCount: 15,
  monthlyApprovedAmount: 5420.00,
  avgProcessingTime: 2.5,
  teamMemberCount: 8,
};

export default function ManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const filteredExpenses = mockPendingExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.submitter.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeamMember = teamMemberFilter === "all" || expense.submitter.id === teamMemberFilter;
    return matchesSearch && matchesTeamMember;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(filteredExpenses.map(e => e.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleExpenseSelect = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId]);
    } else {
      setSelectedExpenses(selectedExpenses.filter(id => id !== expenseId));
    }
  };

  const handleBulkApprove = () => {
    if (selectedExpenses.length === 0) return;
    
    const totalAmount = filteredExpenses
      .filter(e => selectedExpenses.includes(e.id))
      .reduce((sum, e) => sum + e.amount, 0);
    
    if (confirm(`Approve ${selectedExpenses.length} expenses totaling ${formatCurrency(totalAmount, mockCompany.baseCurrency)}?`)) {
      console.log("Bulk approving expenses:", selectedExpenses);
      alert(`${selectedExpenses.length} expenses approved successfully!`);
      setSelectedExpenses([]);
    }
  };

  const handleExport = () => {
    console.log("Exporting expenses...");
    alert("Expenses exported to CSV successfully!");
  };

  const handleRefresh = () => {
    console.log("Refreshing expenses...");
    alert("Expenses refreshed!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ExpenseWise
                </h1>
                <p className="text-xs text-gray-500">{mockCompany.name}</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Currency Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <span className="text-sm font-semibold text-green-700">{mockCompany.baseCurrency}</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {mockStats.pendingCount}
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-semibold">
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
                    <Badge variant="outline" className="mt-1 text-xs">
                      <Users className="h-3 w-3 mr-1 text-green-600" />
                      Manager
                    </Badge>
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
                Approval Dashboard
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                Review and approve expense requests from your team
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 hover:bg-gray-50"
                onClick={() => alert("Filter options coming soon!")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 hover:bg-gray-50"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                disabled={selectedExpenses.length === 0}
                onClick={handleBulkApprove}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Bulk Approve ({selectedExpenses.length})
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Review Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                    <p className="text-2xl font-bold text-orange-600">{mockStats.pendingCount}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatCurrency(mockStats.pendingAmount, mockCompany.baseCurrency)} total
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* This Month Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-green-600">{mockStats.monthlyApprovedCount}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatCurrency(mockStats.monthlyApprovedAmount, mockCompany.baseCurrency)} approved
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Processing Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Avg. Processing</p>
                    <p className="text-2xl font-bold text-blue-600">{mockStats.avgProcessingTime}h</p>
                    <p className="text-xs text-gray-500 mt-2">Response time</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Timer className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">{mockStats.teamMemberCount}</p>
                    <p className="text-xs text-gray-500 mt-2">Reporting to you</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Approvals Table */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Expenses Awaiting Approval
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Review and approve expense requests from your team members
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by employee or description..."
                    className="pl-10 w-full sm:w-80 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={teamMemberFilter} onValueChange={setTeamMemberFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-gray-300">
                    <SelectValue placeholder="All Team Members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Members</SelectItem>
                    <SelectItem value="3">Mike Employee</SelectItem>
                    <SelectItem value="4">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredExpenses.length > 0 ? (
              <PendingApprovalsTable 
                expenses={filteredExpenses}
                selectedExpenses={selectedExpenses}
                onSelectAll={handleSelectAll}
                onSelectExpense={handleExpenseSelect}
                baseCurrency={mockCompany.baseCurrency}
              />
            ) : (
              <EmptyApprovalsState />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PendingApprovalsTable({ 
  expenses, 
  selectedExpenses,
  onSelectAll,
  onSelectExpense,
  baseCurrency,
}: {
  expenses: any[];
  selectedExpenses: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectExpense: (expenseId: string, checked: boolean) => void;
  baseCurrency: string;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 hover:bg-gray-50">
            <TableHead className="w-[50px] font-semibold text-gray-700">
              <Checkbox
                checked={selectedExpenses.length === expenses.length}
                onCheckedChange={onSelectAll}
                aria-label="Select all expenses"
              />
            </TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">Receipt</TableHead>
            <TableHead className="w-[200px] font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <span>Employee</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-gray-200">
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </div>
            </TableHead>
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
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-gray-200">
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="w-[150px] font-semibold text-gray-700">Category</TableHead>
            <TableHead className="w-[180px] font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <span>Amount</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-gray-200">
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="w-[120px] font-semibold text-gray-700">Submitted</TableHead>
            <TableHead className="w-[200px] text-right font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <ApprovalTableRow 
              key={expense.id} 
              expense={expense}
              isSelected={selectedExpenses.includes(expense.id)}
              onSelect={onSelectExpense}
              baseCurrency={baseCurrency}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ApprovalTableRow({ 
  expense, 
  isSelected,
  onSelect,
  baseCurrency,
}: { 
  expense: any;
  isSelected: boolean;
  onSelect: (expenseId: string, checked: boolean) => void;
  baseCurrency: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleQuickApprove = () => {
    if (confirm(`Are you sure you want to approve this expense from ${expense.submitter.name}?`)) {
      setIsProcessing(true);
      console.log("Quick approving expense:", expense.id);
      setTimeout(() => {
        setIsProcessing(false);
        alert(`Expense approved successfully! ${expense.submitter.name} will be notified.`);
      }, 1000);
    }
  };

  const handleQuickReject = () => {
    if (confirm(`Are you sure you want to reject this expense from ${expense.submitter.name}? Please provide a reason.`)) {
      const reason = prompt("Reason for rejection:");
      if (reason) {
        console.log("Quick rejecting expense:", expense.id, "Reason:", reason);
        alert(`Expense rejected. ${expense.submitter.name} will be notified with your feedback.`);
      }
    }
  };

  const handleViewDetails = () => {
    setIsViewModalOpen(true);
    console.log("Viewing expense details:", expense.id);
  };

  const handleApproveWithComments = () => {
    setIsApproveModalOpen(true);
    console.log("Opening approve with comments modal:", expense.id);
  };

  const handleRejectWithComments = () => {
    setIsRejectModalOpen(true);
    console.log("Opening reject with comments modal:", expense.id);
  };

  const handleRequestMoreInfo = () => {
    const message = prompt("What additional information do you need?");
    if (message) {
      console.log("Requesting more info for expense:", expense.id, "Message:", message);
      alert(`Information request sent to ${expense.submitter.name}`);
    }
  };

  const handleForwardToOther = () => {
    const manager = prompt("Enter manager name or email to forward to:");
    if (manager) {
      console.log("Forwarding expense:", expense.id, "To:", manager);
      alert(`Expense forwarded to ${manager}`);
    }
  };

  const handleViewReceipt = () => {
    if (expense.receipt) {
      window.open(expense.receipt.url, '_blank');
    }
  };

  return (
    <TableRow 
      className={cn(
        "hover:bg-green-50/50 transition-colors duration-150 border-b border-gray-100",
        isSelected && "bg-green-50",
        expense.priority === "urgent" && "border-l-4 border-l-red-500"
      )}
    >
      {/* Selection Checkbox */}
      <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(expense.id, checked as boolean)}
          aria-label={`Select expense from ${expense.submitter.name}`}
        />
      </TableCell>

      {/* Receipt Thumbnail */}
      <TableCell className="py-4">
        <div className="relative group">
          {expense.receipt ? (
            <>
              <button onClick={handleViewReceipt} className="focus:outline-none">
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
            </>
          ) : (
            <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
          )}

          {/* Urgency Indicator */}
          {expense.priority === "urgent" && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      </TableCell>

      {/* Employee Information */}
      <TableCell className="py-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={expense.submitter.avatar} alt={expense.submitter.name} />
            <AvatarFallback className="text-xs bg-green-100 text-green-600">
              {getUserInitials(expense.submitter.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{expense.submitter.name}</div>
            <div className="text-xs text-gray-500">{expense.submitter.role}</div>
          </div>
        </div>
      </TableCell>

      {/* Description */}
      <TableCell className="py-4">
        <div>
          <div className="font-semibold text-gray-900 text-sm line-clamp-1" title={expense.description}>
            {expense.description}
          </div>
          {expense.remarks && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1" title={expense.remarks}>
              {expense.remarks}
            </div>
          )}
        </div>
      </TableCell>

      {/* Expense Date */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-700 font-medium">
          {formatDate(expense.expenseDate)}
        </div>
        <div className="text-xs text-gray-500">
          {formatRelativeTime(expense.expenseDate)}
        </div>
      </TableCell>

      {/* Category */}
      <TableCell className="py-4">
        <Badge variant="outline" className="text-xs font-medium border-green-200 text-green-700 bg-green-50">
          {expense.category.name}
        </Badge>
      </TableCell>

      {/* Amount with Currency Conversion */}
      <TableCell className="py-4">
        <div className="space-y-1">
          {/* Original Amount */}
          <div className="font-bold text-gray-900 text-sm">
            {formatCurrency(expense.amount, expense.currency)}
          </div>

          {/* Converted Amount */}
          {expense.currency !== baseCurrency && (
            <>
              <div className="text-sm text-green-600 font-semibold">
                = {formatCurrency(expense.convertedAmount, baseCurrency)}
              </div>
              <div className="text-xs text-gray-500">
                @ {expense.exchangeRate} {expense.currency}/{baseCurrency}
              </div>
            </>
          )}
        </div>
      </TableCell>

      {/* Submission Time */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-500">
          {formatRelativeTime(expense.createdAt)}
        </div>
        <div className="text-xs text-gray-400">
          {formatDate(expense.createdAt)}
        </div>
      </TableCell>

      {/* Action Buttons */}
      <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end space-x-2">
          {/* Quick Approve Button */}
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-300 hover:bg-green-50"
            onClick={handleQuickApprove}
            disabled={isProcessing}
          >
            <Check className="h-4 w-4" />
          </Button>

          {/* Quick Reject Button */}
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={handleQuickReject}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer" onClick={handleViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {expense.receipt && (
                <DropdownMenuItem className="cursor-pointer" onClick={handleViewReceipt}>
                  <Download className="h-4 w-4 mr-2" />
                  View Receipt
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleApproveWithComments}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Approve with Comments
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleRejectWithComments}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Reject with Comments
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleRequestMoreInfo}>
                <Info className="h-4 w-4 mr-2" />
                Request More Information
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleForwardToOther}>
                <Forward className="h-4 w-4 mr-2" />
                Forward to Another Manager
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EmptyApprovalsState() {
  return (
    <div className="text-center py-16">
      <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        There are no pending expense approvals at this time.
      </p>
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>Last checked: {formatDate(new Date())}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            console.log("Refreshing...");
            alert("Refreshed! No new approvals at this time.");
          }}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
}

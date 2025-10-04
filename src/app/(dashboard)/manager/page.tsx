"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Clock,
  TrendingUp,
  Timer,
  Users,
  Search,
  Filter,
  Download,
  CheckCircle,
  Check,
  X,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Info,
  Forward,
  FileText,
  ArrowUpDown,
  LoaderCircle,
  RefreshCw,
  AlertTriangle,
  XCircle,
} from "lucide-react";

// Types
interface Expense {
  id: string;
  submitter: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    initials: string;
  };
  description: string;
  remarks?: string;
  expenseDate: Date;
  category: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  exchangeRateDate?: Date;
  receipt?: {
    url: string;
  };
  createdAt: Date;
  priority: "urgent" | "high" | "normal" | "low";
  isProcessing?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
}

// Mock data generator
const generateMockExpenses = (): Expense[] => {
  const categories = ["Travel", "Meals", "Office Supplies", "Software", "Marketing"];
  const currencies = ["USD", "EUR", "GBP", "INR"];
  const priorities: ("urgent" | "high" | "normal" | "low")[] = ["urgent", "high", "normal", "low"];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `EXP-${1000 + i}`,
    submitter: {
      id: `user-${i}`,
      name: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "Tom Brown"][i % 5],
      role: ["Senior Developer", "Designer", "Marketing Manager", "Sales Rep", "Product Manager"][i % 5],
      initials: ["JD", "JS", "MJ", "SW", "TB"][i % 5],
    },
    description: [
      "Client lunch meeting at downtown restaurant",
      "Flight tickets for conference in San Francisco",
      "Office supplies and stationery",
      "Annual subscription for project management tool",
      "Marketing campaign materials"
    ][i % 5],
    remarks: i % 3 === 0 ? "Urgent approval needed" : undefined,
    expenseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    category: {
      id: `cat-${i % 5}`,
      name: categories[i % 5],
    },
    amount: Math.floor(Math.random() * 2000) + 50,
    currency: currencies[i % 4],
    convertedAmount: undefined,
    exchangeRate: undefined,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    priority: priorities[i % 4],
    receipt: i % 2 === 0 ? { url: "/api/placeholder/200/200" } : undefined,
  }));
};

export default function ManagerDashboard() {
  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [baseCurrency] = useState("USD");
  
  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isBulkApprovalModalOpen, setIsBulkApprovalModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Form states
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionComments, setRejectionComments] = useState("");
  const [bulkComments, setBulkComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load mock data and calculate conversions
  useEffect(() => {
    const mockExpenses = generateMockExpenses();
    
    // Calculate currency conversions
    const exchangeRates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      INR: 83.12,
    };

    const expensesWithConversion = mockExpenses.map(expense => {
      if (expense.currency !== baseCurrency) {
        const rate = exchangeRates[baseCurrency] / exchangeRates[expense.currency];
        return {
          ...expense,
          convertedAmount: expense.amount * rate,
          exchangeRate: rate,
          exchangeRateDate: new Date(),
        };
      }
      return expense;
    });

    setExpenses(expensesWithConversion);
  }, [baseCurrency]);

  // Analytics calculations
  const pendingCount = expenses.length;
  const pendingAmount = expenses.reduce((sum, exp) => sum + (exp.convertedAmount || exp.amount), 0);
  const monthlyApprovedCount = 42; // Mock data
  const monthlyApprovedAmount = 28500; // Mock data
  const avgProcessingTime = 2.5; // Mock data
  const teamMemberCount = 12; // Mock data

  // Team members for filter
  const teamMembers: TeamMember[] = Array.from(
    new Set(expenses.map(e => e.submitter.id))
  ).map(id => {
    const expense = expenses.find(e => e.submitter.id === id)!;
    return { id, name: expense.submitter.name };
  });

  // Filtering logic
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.submitter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeamMember = 
      teamMemberFilter === "all" || expense.submitter.id === teamMemberFilter;
    
    const matchesAmount = (() => {
      const amount = expense.convertedAmount || expense.amount;
      switch (amountFilter) {
        case "under-100": return amount < 100;
        case "100-500": return amount >= 100 && amount <= 500;
        case "500-1000": return amount >= 500 && amount <= 1000;
        case "over-1000": return amount > 1000;
        default: return true;
      }
    })();

    return matchesSearch && matchesTeamMember && matchesAmount;
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(filteredExpenses.map(e => e.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleExpenseSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, id]);
    } else {
      setSelectedExpenses(selectedExpenses.filter(expId => expId !== id));
    }
  };

  // Action handlers
  const handleQuickApprove = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    setSelectedExpense(expense || null);
    setIsApproveModalOpen(true);
  };

  const handleQuickReject = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    setSelectedExpense(expense || null);
    setIsRejectModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsApproveModalOpen(false);
    setApprovalComments("");
    // Remove from list
    setExpenses(expenses.filter(e => e.id !== selectedExpense?.id));
  };

  const handleConfirmReject = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsRejectModalOpen(false);
    setRejectionReason("");
    setRejectionComments("");
    setExpenses(expenses.filter(e => e.id !== selectedExpense?.id));
  };

  const handleBulkApprove = () => {
    if (selectedExpenses.length > 0) {
      setIsBulkApprovalModalOpen(true);
    }
  };

  const handleConfirmBulkApprove = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsBulkApprovalModalOpen(false);
    setBulkComments("");
    setExpenses(expenses.filter(e => !selectedExpenses.includes(e.id)));
    setSelectedExpenses([]);
  };

  // Utility functions
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return formatDate(date);
  };

  // Export functionality
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const exportToCSV = () => {
    const headers = [
      "Expense ID",
      "Employee Name",
      "Employee Role",
      "Description",
      "Category",
      "Amount",
      "Currency",
      "Converted Amount (USD)",
      "Exchange Rate",
      "Expense Date",
      "Submitted Date",
      "Priority",
      "Has Receipt"
    ];

    const rows = filteredExpenses.map(expense => [
      expense.id,
      expense.submitter.name,
      expense.submitter.role,
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.category.name,
      expense.amount,
      expense.currency,
      expense.convertedAmount || expense.amount,
      expense.exchangeRate || 1,
      formatDate(expense.expenseDate),
      formatDate(expense.createdAt),
      expense.priority,
      expense.receipt ? "Yes" : "No"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `pending_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pending Expenses Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1e40af;
            margin: 0 0 10px 0;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .summary {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #2563eb;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
          }
          td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
          }
          tr:hover {
            background: #f9fafb;
          }
          .priority-urgent {
            background: #fef2f2;
            border-left: 3px solid #dc2626;
          }
          .priority-high {
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
          }
          .amount {
            font-weight: bold;
            color: #059669;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            background: #dbeafe;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Pending Expenses Report</h1>
          <p>Manager Dashboard</p>
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">Total Expenses</div>
              <div class="value">${pendingCount}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Amount</div>
              <div class="value">${formatCurrency(pendingAmount, baseCurrency)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Team Members</div>
              <div class="value">${teamMemberCount}</div>
            </div>
            <div class="summary-item">
              <div class="label">Avg Processing</div>
              <div class="value">${avgProcessingTime}h</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            ${filteredExpenses.map(expense => `
              <tr class="priority-${expense.priority}">
                <td>${expense.id}</td>
                <td>
                  <strong>${expense.submitter.name}</strong><br>
                  <span style="color: #666; font-size: 10px;">${expense.submitter.role}</span>
                </td>
                <td>${expense.description}</td>
                <td><span class="badge">${expense.category.name}</span></td>
                <td class="amount">
                  ${formatCurrency(expense.amount, expense.currency)}
                  ${expense.currency !== baseCurrency ? `<br><span style="font-size: 10px; color: #2563eb;">≈ ${formatCurrency(expense.convertedAmount || 0, baseCurrency)}</span>` : ''}
                </td>
                <td>${formatDate(expense.expenseDate)}</td>
                <td style="text-transform: capitalize;">${expense.priority}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report contains ${filteredExpenses.length} pending expense approval(s)</p>
          <p>Confidential - For Internal Use Only</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    }
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const confirmExport = () => {
    if (exportFormat === "csv") {
      exportToCSV();
    } else {
      exportToPDF();
    }
    setIsExportModalOpen(false);
  };

  const bulkApprovalTotal = selectedExpenses.reduce((sum, id) => {
    const expense = expenses.find(e => e.id === id);
    return sum + (expense?.convertedAmount || expense?.amount || 0);
  }, 0);

  const selectedExpensesData = expenses.filter(e => selectedExpenses.includes(e.id));
  const uniqueSubmitters = new Set(selectedExpensesData.map(e => e.submitter.id)).size;
  const hasHighValueExpenses = selectedExpensesData.some(e => 
    (e.convertedAmount || e.amount) > 1000
  );
  const highValueCount = selectedExpensesData.filter(e => 
    (e.convertedAmount || e.amount) > 1000
  ).length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Dashboard Header with Analytics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Review and approve expense requests from your team
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={selectedExpenses.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Bulk Approve ({selectedExpenses.length})
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {formatCurrency(pendingAmount, baseCurrency)} total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">{monthlyApprovedCount}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {formatCurrency(monthlyApprovedAmount, baseCurrency)} approved
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                  <p className="text-2xl font-bold text-blue-600">{avgProcessingTime}h</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Timer className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Response time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{teamMemberCount}</p>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Reporting to you</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Section */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent className="mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by employee or description..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Team Member</Label>
                  <Select value={teamMemberFilter} onValueChange={setTeamMemberFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Team Members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Amount Range</Label>
                  <Select value={amountFilter} onValueChange={setAmountFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Amounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Amounts</SelectItem>
                      <SelectItem value="under-100">Under $100</SelectItem>
                      <SelectItem value="100-500">$100 - $500</SelectItem>
                      <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                      <SelectItem value="over-1000">Over $1,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses Awaiting Approval</CardTitle>
          <CardDescription>
            Review and approve expense requests from your team members
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredExpenses.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all expenses"
                      />
                    </TableHead>
                    <TableHead className="w-[120px]">Receipt</TableHead>
                    <TableHead className="w-[200px]">Employee</TableHead>
                    <TableHead className="w-[250px]">Description</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[150px]">Category</TableHead>
                    <TableHead className="w-[180px]">Amount</TableHead>
                    <TableHead className="w-[120px]">Submitted</TableHead>
                    <TableHead className="w-[200px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedExpenses.includes(expense.id) ? "bg-blue-50" : ""
                      } ${expense.priority === "urgent" ? "border-l-4 border-l-red-500" : ""}`}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedExpenses.includes(expense.id)}
                          onCheckedChange={(checked) => handleExpenseSelect(expense.id, !!checked)}
                          aria-label={`Select expense from ${expense.submitter.name}`}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="relative group">
                          {expense.receipt ? (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg border flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-600" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          {expense.priority === "urgent" && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {expense.submitter.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{expense.submitter.name}</div>
                            <div className="text-sm text-gray-500">{expense.submitter.role}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 truncate" title={expense.description}>
                            {expense.description}
                          </div>
                          {expense.remarks && (
                            <div className="text-sm text-gray-500 truncate mt-1" title={expense.remarks}>
                              {expense.remarks}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-900">{formatDate(expense.expenseDate)}</div>
                        <div className="text-xs text-gray-500">{formatRelativeTime(expense.expenseDate)}</div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {expense.category.name}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(expense.amount, expense.currency)}
                          </div>
                          {expense.currency !== baseCurrency && expense.convertedAmount && (
                            <>
                              <div className="text-sm text-blue-600 font-medium">
                                = {formatCurrency(expense.convertedAmount, baseCurrency)}
                              </div>
                              <div className="text-xs text-gray-500">
                                @ {expense.exchangeRate?.toFixed(4)} {expense.currency}/{baseCurrency}
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-500">{formatRelativeTime(expense.createdAt)}</div>
                        <div className="text-xs text-gray-400">{formatDate(expense.createdAt)}</div>
                      </TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => handleQuickApprove(expense.id)}
                            disabled={expense.isProcessing}
                          >
                            {expense.isProcessing ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleQuickReject(expense.id)}
                            disabled={expense.isProcessing}
                          >
                            <X className="h-4 w-4" />
                          </Button>

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
                              <DropdownMenuItem onClick={() => handleQuickApprove(expense.id)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Approve with Comments
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickReject(expense.id)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Reject with Comments
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Info className="h-4 w-4 mr-2" />
                                Request More Information
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="h-4 w-4 mr-2" />
                                Forward to Another Manager
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600 mb-4">
                There are no pending expense approvals at this time.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Last checked: {new Date().toLocaleTimeString()}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-green-700">
              Approve Expense
            </DialogTitle>
            <DialogDescription>
              Approve this expense request and add optional comments
            </DialogDescription>
          </DialogHeader>

          {selectedExpense && (
            <div className="space-y-4 py-4">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Employee:</span>
                      <span className="ml-2 font-medium">{selectedExpense.submitter.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Description:</span>
                      <span className="ml-2 font-medium">{selectedExpense.description}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="approvalComments" className="text-sm font-medium">
                  Comments (Optional)
                </Label>
                <Textarea
                  id="approvalComments"
                  placeholder="Add any comments or notes about this approval..."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows={3}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  These comments will be visible to the employee and other approvers
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Comments</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setApprovalComments("Approved as per company policy")}
                  >
                    Standard Approval
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setApprovalComments("Approved - Well documented")}
                  >
                    Well Documented
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setApprovalComments("Approved - Valid business expense")}
                  >
                    Valid Expense
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-700">
              Reject Expense
            </DialogTitle>
            <DialogDescription>
              Reject this expense request and provide reason for rejection
            </DialogDescription>
          </DialogHeader>

          {selectedExpense && (
            <div className="space-y-4 py-4">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Employee:</span>
                      <span className="ml-2 font-medium">{selectedExpense.submitter.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Description:</span>
                      <span className="ml-2 font-medium">{selectedExpense.description}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="rejectionReason" className="text-sm font-medium">
                  Reason for Rejection *
                </Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="missing-receipt">Missing or unclear receipt</SelectItem>
                    <SelectItem value="policy-violation">Policy violation</SelectItem>
                    <SelectItem value="excessive-amount">Amount exceeds policy limits</SelectItem>
                    <SelectItem value="invalid-category">Invalid expense category</SelectItem>
                    <SelectItem value="duplicate-submission">Duplicate submission</SelectItem>
                    <SelectItem value="insufficient-detail">Insufficient details</SelectItem>
                    <SelectItem value="personal-expense">Personal expense</SelectItem>
                    <SelectItem value="other">Other (specify in comments)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejectionComments" className="text-sm font-medium">
                  Additional Comments *
                </Label>
                <Textarea
                  id="rejectionComments"
                  placeholder="Provide specific feedback to help the employee understand the rejection..."
                  value={rejectionComments}
                  onChange={(e) => setRejectionComments(e.target.value)}
                  rows={4}
                  className="w-full"
                  required
                />
                <p className="text-xs text-gray-500">
                  Clear feedback helps employees submit compliant expenses in the future
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Consider these alternatives:</p>
                    <ul className="mt-1 text-yellow-700 list-disc list-inside space-y-1">
                      <li>Request additional information instead of outright rejection</li>
                      <li>Suggest resubmission with corrections</li>
                      <li>Forward to another manager if outside your authority</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              variant="destructive"
              disabled={isProcessing || !rejectionReason || !rejectionComments.trim()}
            >
              {isProcessing ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approval Modal */}
      <Dialog open={isBulkApprovalModalOpen} onOpenChange={setIsBulkApprovalModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Bulk Approve Expenses ({selectedExpenses.length})
            </DialogTitle>
            <DialogDescription>
              Review and approve multiple expense requests at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-blue-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedExpenses.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(bulkApprovalTotal, baseCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Team Members</p>
                    <p className="text-2xl font-bold text-blue-900">{uniqueSubmitters}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Expenses to Approve</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead className="w-[150px]">Employee</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[120px]">Amount</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedExpensesData.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.submitter.name}</TableCell>
                        <TableCell className="truncate max-w-[200px]">{expense.description}</TableCell>
                        <TableCell>{formatCurrency(expense.amount, expense.currency)}</TableCell>
                        <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedExpenses(selectedExpenses.filter(id => id !== expense.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulkComments" className="text-sm font-medium">
                Comments for All Expenses (Optional)
              </Label>
              <Textarea
                id="bulkComments"
                placeholder="Add comments that will be applied to all selected expenses..."
                value={bulkComments}
                onChange={(e) => setBulkComments(e.target.value)}
                rows={2}
                className="w-full"
              />
            </div>

            {hasHighValueExpenses && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">High Value Expenses Detected</p>
                    <p className="text-amber-700">
                      {highValueCount} expenses exceed {formatCurrency(1000, baseCurrency)}. Please review individual amounts carefully.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBulkApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing || selectedExpenses.length === 0}
            >
              {isProcessing ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All ({selectedExpenses.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Export Expenses Report
            </DialogTitle>
            <DialogDescription>
              Choose the format for your export
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export Format</Label>
              
              <div className="space-y-2">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    exportFormat === "csv"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setExportFormat("csv")}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      exportFormat === "csv" ? "border-blue-500" : "border-gray-300"
                    }`}>
                      {exportFormat === "csv" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="font-medium">CSV (Excel)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Download as spreadsheet file. Perfect for Excel or Google Sheets.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">Spreadsheet</Badge>
                        <Badge variant="secondary" className="text-xs">Easy to Edit</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    exportFormat === "pdf"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setExportFormat("pdf")}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      exportFormat === "pdf" ? "border-blue-500" : "border-gray-300"
                    }`}>
                      {exportFormat === "pdf" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span className="font-medium">PDF Document</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Formatted report ready for printing or sharing.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">Print Ready</Badge>
                        <Badge variant="secondary" className="text-xs">Professional</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expenses to export:</span>
                    <span className="font-semibold">{filteredExpenses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total amount:</span>
                    <span className="font-semibold">{formatCurrency(pendingAmount, baseCurrency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">File name:</span>
                    <span className="font-mono text-xs text-gray-500">
                      pending_expenses_{new Date().toISOString().split('T')[0]}.{exportFormat}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Export includes:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• All visible expenses based on current filters</li>
                    <li>• Currency conversion details</li>
                    <li>• Employee and category information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export as {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
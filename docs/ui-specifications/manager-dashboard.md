# Manager Dashboard UI Specification

## Overview

The Manager Dashboard is designed to provide managers with a streamlined interface for reviewing and processing expense approvals from their team members. It features real-time currency conversion, clear approval workflows, and efficient bulk processing capabilities.

### Technology Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui + Radix UI primitives
- **State Management**: React hooks with TypeScript
- **Accessibility**: WCAG 2.1 AA compliance
- **Icons**: Lucide React

### Related Documentation

- [Design System](./design-system.md) - Colors, typography, and spacing guidelines
- [Component Library](./component-library.md) - Reusable UI components
- [Admin Dashboard](./admin-dashboard.md) - Admin interface specifications
- [Employee Dashboard](./employee-dashboard.md) - Employee interface specifications

---

## Route Configuration

- **Path**: `/dashboard/manager`
- **Method**: `GET`
- **Authentication**: Required (Manager role)
- **Layout**: Authenticated dashboard layout with sidebar navigation

---

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              Header Navigation                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│           │                                                                         │
│           │                        Main Content Area                               │
│  Sidebar  │                                                                         │
│    Nav    │  ┌─────────────────────────────────────────────────────────────────┐  │
│           │  │                Dashboard Header & Stats                        │  │
│           │  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                                         │
│           │  ┌─────────────────────────────────────────────────────────────────┐  │
│           │  │                                                                 │  │
│           │  │               Pending Approvals Table                           │  │
│           │  │                                                                 │  │
│           │  │                                                                 │  │
│           │  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Dashboard Header with Analytics

### Component Specifications

#### 1. Page Header with Quick Stats

```tsx
<div className="mb-8">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Approval Dashboard</h1>
      <p className="text-gray-600 mt-1">
        Review and approve expense requests from your team
      </p>
    </div>
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      <Button variant="outline" size="sm">
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
            <p className="text-2xl font-bold text-green-600">
              {monthlyApprovedCount}
            </p>
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
            <p className="text-2xl font-bold text-blue-600">
              {avgProcessingTime}h
            </p>
          </div>
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Timer className="h-4 w-4 text-primary-600" />
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
            <p className="text-2xl font-bold text-gray-900">
              {teamMemberCount}
            </p>
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
```

---

## Section 2: Pending Approvals Table

### Component Specifications

#### 1. Table Container with Filtering

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Expenses Awaiting Approval</CardTitle>
        <CardDescription>
          Review and approve expense requests from your team members
        </CardDescription>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by employee or description..."
            className="pl-10 w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={teamMemberFilter} onValueChange={setTeamMemberFilter}>
          <SelectTrigger className="w-48">
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
        <Select value={amountFilter} onValueChange={setAmountFilter}>
          <SelectTrigger className="w-40">
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
  </CardHeader>

  <CardContent>
    {pendingApprovals.length > 0 ? (
      <PendingApprovalsTable approvals={filteredApprovals} />
    ) : (
      <EmptyApprovalsState />
    )}
  </CardContent>
</Card>
```

#### 2. Pending Approvals Table Header

```tsx
<Table>
  <TableHeader>
    <TableRow className="bg-gray-50">
      <TableHead className="w-[50px]">
        <Checkbox
          checked={selectedExpenses.length === filteredApprovals.length}
          onCheckedChange={handleSelectAll}
          aria-label="Select all expenses"
        />
      </TableHead>
      <TableHead className="w-[120px]">Receipt</TableHead>
      <TableHead className="w-[200px]">
        <div className="flex items-center space-x-2">
          <span>Employee</span>
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      </TableHead>
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
      <TableHead className="w-[180px]">
        <div className="flex items-center space-x-2">
          <span>Amount</span>
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      </TableHead>
      <TableHead className="w-[120px]">Submitted</TableHead>
      <TableHead className="w-[200px] text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>{/* Table rows implementation below */}</TableBody>
</Table>
```

#### 3. Approval Table Row Template

```tsx
<TableRow
  className={cn(
    "hover:bg-gray-50 cursor-pointer transition-colors",
    selectedExpenses.includes(expense.id) && "bg-blue-50",
    expense.priority === "urgent" && "border-l-4 border-l-red-500"
  )}
  onClick={() => handleExpenseClick(expense.id)}
>
  {/* Selection Checkbox */}
  <TableCell onClick={(e) => e.stopPropagation()}>
    <Checkbox
      checked={selectedExpenses.includes(expense.id)}
      onCheckedChange={(checked) => handleExpenseSelect(expense.id, checked)}
      aria-label={`Select expense from ${expense.submitter.name}`}
    />
  </TableCell>

  {/* Receipt Thumbnail */}
  <TableCell>
    <div className="relative group">
      {expense.receipt ? (
        <>
          <img
            src={expense.receipt.url}
            alt="Receipt"
            className="h-12 w-12 object-cover rounded-lg border cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              openReceiptModal(expense.receipt.url);
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
            <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </>
      ) : (
        <div className="h-12 w-12 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
          <FileText className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Urgency Indicator */}
      {expense.priority === "urgent" && (
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
      )}
    </div>
  </TableCell>

  {/* Employee Information */}
  <TableCell>
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={expense.submitter.avatar}
          alt={expense.submitter.name}
        />
        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
          {expense.submitter.initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-gray-900">
          {expense.submitter.name}
        </div>
        <div className="text-sm text-gray-500">{expense.submitter.role}</div>
      </div>
    </div>
  </TableCell>

  {/* Description with Truncation */}
  <TableCell>
    <div>
      <div
        className="font-medium text-gray-900 truncate"
        title={expense.description}
      >
        {expense.description}
      </div>
      {expense.remarks && (
        <div
          className="text-sm text-gray-500 truncate mt-1"
          title={expense.remarks}
        >
          {expense.remarks}
        </div>
      )}
    </div>
  </TableCell>

  {/* Expense Date */}
  <TableCell>
    <div className="text-sm text-gray-900">
      {formatDate(expense.expenseDate, "MMM dd, yyyy")}
    </div>
    <div className="text-xs text-gray-500">
      {formatRelativeTime(expense.expenseDate)}
    </div>
  </TableCell>

  {/* Category */}
  <TableCell>
    <Badge variant="outline" className="text-xs">
      {expense.category.name}
    </Badge>
  </TableCell>

  {/* Amount with Currency Conversion */}
  <TableCell>
    <div className="space-y-1">
      {/* Original Amount */}
      <div className="font-medium text-gray-900">
        {formatCurrency(expense.amount, expense.currency)}
      </div>

      {/* Converted Amount (Critical Feature) */}
      {expense.currency !== baseCurrency && (
        <div className="text-sm text-blue-600 font-medium">
          = {formatCurrency(expense.convertedAmount, baseCurrency)}
        </div>
      )}

      {/* Exchange Rate Info */}
      {expense.currency !== baseCurrency && (
        <div className="text-xs text-gray-500">
          @ {expense.exchangeRate} {expense.currency}/{baseCurrency}
        </div>
      )}
    </div>
  </TableCell>

  {/* Submission Time */}
  <TableCell>
    <div className="text-sm text-gray-500">
      {formatRelativeTime(expense.createdAt)}
    </div>
    <div className="text-xs text-gray-400">
      {formatDate(expense.createdAt, "MMM dd")}
    </div>
  </TableCell>

  {/* Action Buttons */}
  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-end space-x-2">
      {/* Quick Approve Button */}
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

      {/* Quick Reject Button */}
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => handleQuickReject(expense.id)}
        disabled={expense.isProcessing}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleViewDetails(expense.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleApproveWithComments(expense.id)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Approve with Comments
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleRejectWithComments(expense.id)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Reject with Comments
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRequestMoreInfo(expense.id)}>
            <Info className="h-4 w-4 mr-2" />
            Request More Information
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleForwardToOther(expense.id)}>
            <Forward className="h-4 w-4 mr-2" />
            Forward to Another Manager
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </TableCell>
</TableRow>
```

#### 4. Empty State Component

```tsx
function EmptyApprovalsState() {
  return (
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
          <span>Last checked: {formatTime(new Date())}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
```

---

## Section 3: Approval Action Modals

### Component Specifications

#### 1. Approve with Comments Modal

```tsx
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

    <div className="space-y-4 py-4">
      {/* Expense Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Employee:</span>
              <span className="ml-2 font-medium">
                {selectedExpense.submitter.name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium text-green-600">
                {formatCurrency(
                  selectedExpense.amount,
                  selectedExpense.currency
                )}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Description:</span>
              <span className="ml-2 font-medium">
                {selectedExpense.description}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
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

      {/* Quick Comment Templates */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Comments</Label>
        <div className="flex flex-wrap gap-2">
          {approvalTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              onClick={() => setApprovalComments(template.text)}
            >
              {template.label}
            </Button>
          ))}
        </div>
      </div>
    </div>

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
```

#### 2. Reject with Comments Modal

```tsx
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

    <div className="space-y-4 py-4">
      {/* Expense Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Employee:</span>
              <span className="ml-2 font-medium">
                {selectedExpense.submitter.name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium text-red-600">
                {formatCurrency(
                  selectedExpense.amount,
                  selectedExpense.currency
                )}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Description:</span>
              <span className="ml-2 font-medium">
                {selectedExpense.description}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Reason (Required) */}
      <div className="space-y-2">
        <Label htmlFor="rejectionReason" className="text-sm font-medium">
          Reason for Rejection *
        </Label>
        <Select value={rejectionReason} onValueChange={setRejectionReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="missing-receipt">
              Missing or unclear receipt
            </SelectItem>
            <SelectItem value="policy-violation">Policy violation</SelectItem>
            <SelectItem value="excessive-amount">
              Amount exceeds policy limits
            </SelectItem>
            <SelectItem value="invalid-category">
              Invalid expense category
            </SelectItem>
            <SelectItem value="duplicate-submission">
              Duplicate submission
            </SelectItem>
            <SelectItem value="insufficient-detail">
              Insufficient details
            </SelectItem>
            <SelectItem value="personal-expense">Personal expense</SelectItem>
            <SelectItem value="other">Other (specify in comments)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Additional Comments */}
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

      {/* Suggested Actions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">
              Consider these alternatives:
            </p>
            <ul className="mt-1 text-yellow-700 list-disc list-inside">
              <li>
                Request additional information instead of outright rejection
              </li>
              <li>Suggest resubmission with corrections</li>
              <li>Forward to another manager if outside your authority</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

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
```

#### 3. Bulk Approval Modal

```tsx
<Dialog
  open={isBulkApprovalModalOpen}
  onOpenChange={setIsBulkApprovalModalOpen}
>
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
      {/* Summary Statistics */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-blue-600">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-900">
                {selectedExpenses.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(bulkApprovalTotal, baseCurrency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Team Members</p>
              <p className="text-2xl font-bold text-blue-900">
                {uniqueSubmitters.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense List for Review */}
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
                  <TableCell className="font-medium">
                    {expense.submitter.name}
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(expense.amount, expense.currency)}
                  </TableCell>
                  <TableCell>
                    {formatDate(expense.expenseDate, "MMM dd")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromBulkApproval(expense.id)}
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

      {/* Bulk Comments */}
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

      {/* Warning Messages */}
      {hasHighValueExpenses && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">
                High Value Expenses Detected
              </p>
              <p className="text-amber-700">
                {highValueCount} expenses exceed{" "}
                {formatCurrency(1000, baseCurrency)}. Please review individual
                amounts carefully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsBulkApprovalModalOpen(false)}
      >
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
            Processing {processedCount}/{selectedExpenses.length}...
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
```

---

## Section 4: Currency Conversion Features

### Component Specifications

#### 1. Currency Conversion Display Logic

```tsx
function CurrencyDisplayCell({
  expense,
  baseCurrency,
}: {
  expense: Expense;
  baseCurrency: string;
}) {
  const isOriginalCurrency = expense.currency === baseCurrency;
  const conversionRate = expense.exchangeRate;
  const convertedAmount = expense.amount * conversionRate;

  return (
    <div className="space-y-1">
      {/* Original Amount */}
      <div
        className={cn(
          "font-medium",
          isOriginalCurrency ? "text-gray-900" : "text-gray-600"
        )}
      >
        {formatCurrency(expense.amount, expense.currency)}
      </div>

      {/* Converted Amount - Critical Feature */}
      {!isOriginalCurrency && (
        <>
          <div className="text-sm font-medium text-blue-600">
            = {formatCurrency(convertedAmount, baseCurrency)}
          </div>

          {/* Exchange Rate and Date */}
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>Rate: {conversionRate.toFixed(4)}</div>
            <div>As of {formatDate(expense.exchangeRateDate, "MMM dd")}</div>
          </div>

          {/* Rate freshness indicator */}
          <div className="flex items-center text-xs">
            {isExchangeRateFresh(expense.exchangeRateDate) ? (
              <div className="flex items-center text-green-600">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1" />
                Current
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <div className="h-1.5 w-1.5 bg-amber-500 rounded-full mr-1" />
                Historical
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

#### 2. Currency Conversion Tooltip

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
      <Info className="h-3 w-3" />
    </Button>
  </TooltipTrigger>
  <TooltipContent className="max-w-xs">
    <div className="space-y-2 text-sm">
      <p className="font-medium">Currency Conversion Details</p>
      <div className="space-y-1">
        <div>Original: {formatCurrency(expense.amount, expense.currency)}</div>
        <div>
          Rate: 1 {expense.currency} = {conversionRate} {baseCurrency}
        </div>
        <div>Converted: {formatCurrency(convertedAmount, baseCurrency)}</div>
        <div className="text-xs text-gray-500">
          Rate from {formatDate(expense.exchangeRateDate)}
        </div>
      </div>
    </div>
  </TooltipContent>
</Tooltip>
```

---

## Section 5: Real-time Updates and Notifications

### Component Specifications

#### 1. Real-time Approval Status

```tsx
// WebSocket connection for real-time updates
useEffect(() => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "EXPENSE_UPDATED") {
      // Update local state with new expense status
      updateExpenseInList(data.expenseId, data.updates);

      // Show toast notification
      if (data.updates.status === "APPROVED") {
        toast.success(`Expense ${data.expenseId} approved by ${data.approver}`);
      }
    }
  };

  return () => ws.close();
}, []);
```

#### 2. Approval Progress Indicators

```tsx
function ApprovalProgressIndicator({ expense }: { expense: Expense }) {
  const { approvals, currentStep, totalSteps } = expense.approvalFlow;

  return (
    <div className="space-y-2">
      <div className="flex items-center text-xs text-gray-600">
        <User className="h-3 w-3 mr-1" />
        Step {currentStep} of {totalSteps}
      </div>

      <div className="flex items-center space-x-1">
        {approvals.map((approval, index) => (
          <div
            key={approval.id}
            className={cn(
              "h-2 w-6 rounded-full",
              approval.status === "APPROVED" && "bg-green-500",
              approval.status === "REJECTED" && "bg-red-500",
              approval.status === "PENDING" &&
                index === currentStep - 1 &&
                "bg-orange-500 animate-pulse",
              approval.status === "PENDING" &&
                index !== currentStep - 1 &&
                "bg-gray-200"
            )}
          />
        ))}
      </div>

      {expense.estimatedCompletionTime && (
        <div className="text-xs text-gray-500">
          Est. completion: {formatRelativeTime(expense.estimatedCompletionTime)}
        </div>
      )}
    </div>
  );
}
```

#### 3. Toast Notifications for Actions

```tsx
function useApprovalNotifications() {
  const handleApproveSuccess = (expense: Expense) => {
    toast.success(
      <div className="flex items-center space-x-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium">Expense Approved</p>
          <p className="text-sm text-gray-600">
            {expense.submitter.name}'s expense for{" "}
            {formatCurrency(expense.amount, expense.currency)}
          </p>
        </div>
      </div>,
      { duration: 4000 }
    );
  };

  const handleRejectSuccess = (expense: Expense) => {
    toast.error(
      <div className="flex items-center space-x-3">
        <XCircle className="h-5 w-5 text-red-600" />
        <div>
          <p className="font-medium">Expense Rejected</p>
          <p className="text-sm text-gray-600">
            {expense.submitter.name} will be notified
          </p>
        </div>
      </div>,
      { duration: 4000 }
    );
  };

  return { handleApproveSuccess, handleRejectSuccess };
}
```

---

## Section 6: Advanced Filtering and Sorting

### Component Specifications

#### 1. Advanced Filter Panel

```tsx
<Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="outline" size="sm">
      <Filter className="h-4 w-4 mr-2" />
      Advanced Filters
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-2">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  </CollapsibleTrigger>

  <CollapsibleContent className="mt-4">
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Categories</Label>
            <MultiSelect
              options={categories}
              value={selectedCategories}
              onChange={setSelectedCategories}
              placeholder="All categories"
            />
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button variant="ghost" onClick={clearAllFilters}>
            Clear All
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={saveFilterPreset}>
              Save Preset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </CollapsibleContent>
</Collapsible>
```

#### 2. Saved Filter Presets

```tsx
<div className="flex items-center space-x-2 mb-4">
  <Label className="text-sm font-medium">Quick Filters:</Label>
  {filterPresets.map((preset) => (
    <Button
      key={preset.id}
      variant={activePreset === preset.id ? "default" : "outline"}
      size="sm"
      onClick={() => applyFilterPreset(preset)}
    >
      {preset.name}
      {preset.count > 0 && (
        <Badge variant="secondary" className="ml-2">
          {preset.count}
        </Badge>
      )}
    </Button>
  ))}
</div>
```

---

## Responsive Design and Mobile Optimization

### Mobile Layout (< 768px)

#### 1. Mobile-Optimized Approval Cards

```tsx
// Replace table with card-based layout on mobile
<div className="space-y-4 md:hidden">
  {pendingApprovals.map((expense) => (
    <ApprovalCard key={expense.id} expense={expense} />
  ))}
</div>;

function ApprovalCard({ expense }: { expense: Expense }) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Header with Employee and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={expense.submitter.avatar}
                alt={expense.submitter.name}
              />
              <AvatarFallback className="text-xs">
                {expense.submitter.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{expense.submitter.name}</p>
              <p className="text-xs text-gray-500">{expense.submitter.role}</p>
            </div>
          </div>
          <Checkbox
            checked={selectedExpenses.includes(expense.id)}
            onCheckedChange={(checked) =>
              handleExpenseSelect(expense.id, checked)
            }
          />
        </div>

        {/* Expense Details */}
        <div>
          <p className="font-medium text-gray-900 mb-1">
            {expense.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatDate(expense.expenseDate)}</span>
            <Badge variant="outline" className="text-xs">
              {expense.category.name}
            </Badge>
          </div>
        </div>

        {/* Amount with Conversion */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(expense.amount, expense.currency)}
              </p>
              {expense.currency !== baseCurrency && (
                <p className="text-sm text-blue-600 font-medium">
                  = {formatCurrency(expense.convertedAmount, baseCurrency)}
                </p>
              )}
            </div>

            {/* Receipt Indicator */}
            <div className="text-right">
              {expense.receipt ? (
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              ) : (
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-green-600 border-green-300"
            onClick={() => handleQuickApprove(expense.id)}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-600 border-red-300"
            onClick={() => handleQuickReject(expense.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewDetails(expense.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### Touch Interactions and Gestures

#### 1. Swipe Actions for Mobile

```tsx
// Implement swipe gestures for quick actions
<div className="relative overflow-hidden" {...swipeHandlers}>
  <ApprovalCard expense={expense} />

  {/* Swipe Action Backgrounds */}
  <div
    className={cn(
      "absolute inset-y-0 left-0 flex items-center justify-center bg-green-500 text-white px-6 transition-transform",
      swipeDirection === "right" ? "translate-x-0" : "-translate-x-full"
    )}
  >
    <Check className="h-6 w-6" />
  </div>

  <div
    className={cn(
      "absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white px-6 transition-transform",
      swipeDirection === "left" ? "translate-x-0" : "translate-x-full"
    )}
  >
    <X className="h-6 w-6" />
  </div>
</div>
```

---

## Performance and Security Considerations

### 1. Optimistic Updates

```tsx
// Implement optimistic updates for better UX
const handleQuickApprove = async (expenseId: string) => {
  // Optimistically update UI
  updateExpenseStatusOptimistically(expenseId, "APPROVED");

  try {
    await approveExpense(expenseId);
    toast.success("Expense approved successfully");
  } catch (error) {
    // Revert optimistic update on error
    revertExpenseStatusUpdate(expenseId);
    toast.error("Failed to approve expense");
  }
};
```

### 2. Rate Limiting and Validation

```tsx
// Implement rate limiting for approval actions
const { execute: executeApproval, isLoading } = useRateLimit(
  approveExpense,
  { maxRequests: 10, windowMs: 60000 } // 10 approvals per minute
);
```

### 3. Audit Trail

```tsx
// Log all approval actions for audit purposes
const logApprovalAction = (action: ApprovalAction) => {
  auditLog.create({
    userId: currentUser.id,
    action: action.type,
    expenseId: action.expenseId,
    metadata: {
      comments: action.comments,
      timestamp: new Date(),
      ipAddress: getClientIP(),
      userAgent: navigator.userAgent,
    },
  });
};
```

This comprehensive Manager Dashboard specification provides a complete blueprint for implementing a professional-grade expense approval interface with advanced features like real-time currency conversion, bulk processing, and mobile optimization.

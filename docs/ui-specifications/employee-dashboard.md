# Employee Dashboard UI Specification

## Overview

The Employee Dashboard is the primary interface for employees to submit new expense claims and track the status of their submissions. It features a comprehensive expense history table and an intuitive expense submission workflow with OCR-powered receipt processing.

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
- [Manager Dashboard](./manager-dashboard.md) - Manager interface specifications

---

## Route Configuration

- **Path**: `/dashboard/employee`
- **Method**: `GET`
- **Authentication**: Required (Employee role)
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
│           │  │                    Page Header                                  │  │
│           │  │  [My Expenses] [Quick Stats] [New Expense Button]              │  │
│           │  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                                         │
│           │  ┌─────────────────────────────────────────────────────────────────┐  │
│           │  │                                                                 │  │
│           │  │                 Expense History Table                           │  │
│           │  │                                                                 │  │
│           │  │                                                                 │  │
│           │  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Dashboard Header

### Component Specifications

#### 1. Page Header with Stats

```tsx
<div className="mb-8">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
      <p className="text-gray-600 mt-1">
        Track and manage your expense submissions
      </p>
    </div>
    <Button
      size="lg"
      className="bg-primary-600 hover:bg-primary-700 text-white"
    >
      <Plus className="h-5 w-5 mr-2" />
      New Expense
    </Button>
  </div>

  {/* Quick Stats Cards */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(monthlyTotal, baseCurrency)}
            </p>
          </div>
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          </div>
          <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          </div>
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          </div>
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
```

---

## Section 2: Expense History Table

### Component Specifications

#### 1. Table Container with Filters

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Expense History</CardTitle>
        <CardDescription>
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

  <CardContent>
    <Table>{/* Table implementation below */}</Table>
  </CardContent>
</Card>
```

#### 2. Expense Table Header

```tsx
<TableHeader>
  <TableRow className="bg-gray-50">
    <TableHead className="w-[50px]">
      <Checkbox
        checked={selectedExpenses.length === expenses.length}
        onCheckedChange={handleSelectAll}
        aria-label="Select all expenses"
      />
    </TableHead>
    <TableHead className="w-[120px]">Receipt</TableHead>
    <TableHead className="w-[200px]">
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
    <TableHead className="w-[140px]">Status</TableHead>
    <TableHead className="w-[120px]">Submitted</TableHead>
    <TableHead className="w-[100px] text-right">Actions</TableHead>
  </TableRow>
</TableHeader>
```

#### 3. Expense Table Row Template

```tsx
<TableRow
  className={cn(
    "hover:bg-gray-50 cursor-pointer",
    selectedExpenses.includes(expense.id) && "bg-blue-50"
  )}
  onClick={() => handleExpenseClick(expense.id)}
>
  {/* Selection Checkbox */}
  <TableCell onClick={(e) => e.stopPropagation()}>
    <Checkbox
      checked={selectedExpenses.includes(expense.id)}
      onCheckedChange={(checked) => handleExpenseSelect(expense.id, checked)}
      aria-label={`Select expense ${expense.description}`}
    />
  </TableCell>

  {/* Receipt Thumbnail */}
  <TableCell>
    {expense.receipt ? (
      <div className="relative group">
        <img
          src={expense.receipt.url}
          alt="Receipt"
          className="h-12 w-12 object-cover rounded-lg border"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
          <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    ) : (
      <div className="h-12 w-12 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
        <FileText className="h-4 w-4 text-gray-400" />
      </div>
    )}
  </TableCell>

  {/* Description */}
  <TableCell>
    <div>
      <div className="font-medium text-gray-900 truncate">
        {expense.description}
      </div>
      {expense.remarks && (
        <div className="text-sm text-gray-500 truncate mt-1">
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
  </TableCell>

  {/* Category */}
  <TableCell>
    <Badge variant="outline" className="text-xs">
      {expense.category.name}
    </Badge>
  </TableCell>

  {/* Amount with Currency */}
  <TableCell>
    <div className="space-y-1">
      <div className="font-medium text-gray-900">
        {formatCurrency(expense.amount, expense.currency)}
      </div>
      {expense.currency !== baseCurrency && (
        <div className="text-xs text-gray-500">
          ≈ {formatCurrency(convertedAmount, baseCurrency)}
        </div>
      )}
    </div>
  </TableCell>

  {/* Status with Approval Progress */}
  <TableCell>
    <div className="space-y-2">
      <ExpenseStatusBadge status={expense.status} />
      {expense.status === "PENDING_APPROVAL" && (
        <ApprovalProgress expense={expense} />
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
  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewExpense(expense.id)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        {expense.status === "DRAFT" && (
          <>
            <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSubmitExpense(expense.id)}>
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => handleDuplicateExpense(expense.id)}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        {expense.status === "DRAFT" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteExpense(expense.id)}
              className="text-red-600"
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
```

#### 4. Status Badge Component

```tsx
function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  const statusConfig = {
    DRAFT: {
      label: "Draft",
      variant: "secondary" as const,
      icon: FileText,
      className: "bg-gray-100 text-gray-800",
    },
    PENDING_APPROVAL: {
      label: "Pending",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-orange-100 text-orange-800",
    },
    APPROVED: {
      label: "Approved",
      variant: "secondary" as const,
      icon: CheckCircle,
      className: "bg-green-100 text-green-800",
    },
    REJECTED: {
      label: "Rejected",
      variant: "secondary" as const,
      icon: XCircle,
      className: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
```

#### 5. Approval Progress Component

```tsx
function ApprovalProgress({ expense }: { expense: Expense }) {
  const { approvals, currentApprover } = expense;

  return (
    <div className="space-y-1">
      <div className="flex items-center text-xs text-gray-600">
        <User className="h-3 w-3 mr-1" />
        With {currentApprover.name}
      </div>
      <div className="flex items-center space-x-1">
        {approvals.map((approval, index) => (
          <div
            key={approval.id}
            className={cn(
              "h-1.5 w-4 rounded-full",
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
```

---

## Section 3: New Expense Modal/Form

### Component Specifications

#### 1. Modal Structure

```tsx
<Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">
        {editingExpense ? "Edit Expense" : "Create New Expense"}
      </DialogTitle>
      <DialogDescription>
        {editingExpense
          ? "Update your expense details below"
          : "Add a new expense claim with receipt and details"}
      </DialogDescription>
    </DialogHeader>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
      {/* Left Column - Receipt Upload */}
      <div className="space-y-4">
        <ReceiptUploadSection />
      </div>

      {/* Right Column - Expense Form */}
      <div className="space-y-4">
        <ExpenseFormSection />
      </div>
    </div>

    <DialogFooter>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {isProcessingOCR && (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>Processing receipt...</span>
            </>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 2. Receipt Upload Section

```tsx
function ReceiptUploadSection() {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: handleReceiptUpload,
  });

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Receipt Upload</Label>

      {!receiptFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? "Drop receipt here" : "Upload receipt"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop your receipt or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports JPG, PNG, PDF up to 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Receipt Preview */}
          <div className="relative">
            {receiptFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(receiptFile)}
                alt="Receipt preview"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{receiptFile.name}</p>
                </div>
              </div>
            )}

            {/* Remove/Replace buttons */}
            <div className="absolute top-2 right-2 space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReplaceReceipt}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemoveReceipt}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* OCR Processing Status */}
          {isProcessingOCR && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <LoaderCircle className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Processing receipt...
                  </p>
                  <p className="text-xs text-blue-700">
                    Extracting expense details automatically
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OCR Results */}
          {ocrResults && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Receipt processed successfully
                    </p>
                    <p className="text-xs text-green-700">
                      Expense details have been populated
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApplyOCRResults}
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### 3. Expense Form Section

```tsx
function ExpenseFormSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description *
          </Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g., Business lunch with client"
            className="w-full"
          />
          {ocrResults?.description && (
            <p className="text-xs text-blue-600">
              Auto-detected: {ocrResults.description}
            </p>
          )}
        </div>

        {/* Date and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expenseDate" className="text-sm font-medium">
              Expense Date *
            </Label>
            <DatePicker
              selected={formData.expenseDate}
              onChange={(date) =>
                setFormData({ ...formData, expenseDate: date })
              }
              className="w-full"
              maxDate={new Date()}
              placeholderText="Select date"
            />
            {ocrResults?.date && (
              <p className="text-xs text-blue-600">
                Auto-detected: {formatDate(ocrResults.date)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(categoryId) =>
                setFormData({ ...formData, categoryId })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amount and Currency Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              className="w-full"
            />
            {ocrResults?.amount && (
              <p className="text-xs text-blue-600">
                Auto-detected: {ocrResults.amount}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency *
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(currency) =>
                setFormData({ ...formData, currency })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center space-x-2">
                      <span>{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-gray-500">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.currency !== baseCurrency && formData.amount && (
              <p className="text-xs text-gray-500">
                ≈ {formatCurrency(convertedAmount, baseCurrency)}
              </p>
            )}
          </div>
        </div>

        {/* Remarks Field */}
        <div className="space-y-2">
          <Label htmlFor="remarks" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
            placeholder="Any additional context or notes..."
            rows={3}
            className="w-full"
          />
        </div>

        {/* Approval Preview */}
        {approvalPreview && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Approval Workflow Preview
            </h4>
            <div className="space-y-2">
              {approvalPreview.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-sm"
                >
                  <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={step.approver.avatar}
                      alt={step.approver.name}
                    />
                    <AvatarFallback className="text-xs">
                      {step.approver.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700">{step.approver.name}</span>
                  <span className="text-gray-500">({step.approver.role})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### OCR Integration Workflow

#### 1. Receipt Processing Flow

```tsx
async function handleReceiptUpload(acceptedFiles: File[]) {
  const file = acceptedFiles[0];
  if (!file) return;

  setReceiptFile(file);
  setIsProcessingOCR(true);

  try {
    // Upload file to storage
    const uploadResult = await uploadReceipt(file);

    // Process with OCR service
    const ocrResult = await processReceiptOCR(uploadResult.url);

    // Parse and structure results
    const structuredData = parseOCRResults(ocrResult);

    setOcrResults(structuredData);

    // Auto-apply if confidence is high
    if (structuredData.confidence > 0.8) {
      applyOCRDataToForm(structuredData);
    }
  } catch (error) {
    toast.error("Failed to process receipt. Please enter details manually.");
  } finally {
    setIsProcessingOCR(false);
  }
}
```

#### 2. OCR Data Structure

```typescript
interface OCRResults {
  confidence: number;
  description?: string;
  amount?: number;
  currency?: string;
  date?: Date;
  vendor?: string;
  category?: string;
  extractedText: string;
}
```

### Form Validation

#### Client-Side Validation Rules

- **Description**: Required, 3-200 characters
- **Amount**: Required, positive number, max 2 decimal places
- **Currency**: Required, valid currency code
- **Expense Date**: Required, not in future, within last 365 days
- **Category**: Required, valid category ID
- **Receipt**: Optional but recommended

#### Real-time Validation Display

```tsx
<div className="space-y-2">
  <Label htmlFor="amount" className="text-sm font-medium">
    Amount *
  </Label>
  <Input
    id="amount"
    type="number"
    value={formData.amount}
    onChange={handleAmountChange}
    className={cn(
      "w-full",
      validationErrors.amount && "border-red-500 focus:ring-red-500"
    )}
    aria-describedby="amount-error"
  />
  {validationErrors.amount && (
    <p id="amount-error" className="text-sm text-red-600" role="alert">
      {validationErrors.amount}
    </p>
  )}
</div>
```

---

## Section 4: Expense Detail View

### Component Specifications

#### 1. Detail Modal Structure

```tsx
<Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-xl font-semibold">
            Expense Details
          </DialogTitle>
          <DialogDescription>
            View complete expense information and approval status
          </DialogDescription>
        </div>
        <div className="flex items-center space-x-2">
          <ExpenseStatusBadge status={expense.status} />
          {expense.status === "DRAFT" && (
            <Button size="sm" onClick={() => handleEditExpense(expense.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </DialogHeader>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
      {/* Left Column - Receipt and Basic Info */}
      <div className="space-y-6">
        <ReceiptDisplaySection expense={expense} />
        <ExpenseBasicInfo expense={expense} />
      </div>

      {/* Right Column - Approval Status and History */}
      <div className="space-y-6">
        <ApprovalStatusSection expense={expense} />
        <ExpenseHistorySection expense={expense} />
      </div>
    </div>
  </DialogContent>
</Dialog>
```

#### 2. Receipt Display Section

```tsx
function ReceiptDisplaySection({ expense }: { expense: Expense }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Receipt</CardTitle>
      </CardHeader>
      <CardContent>
        {expense.receipt ? (
          <div className="space-y-4">
            {expense.receipt.fileType.startsWith("image/") ? (
              <img
                src={expense.receipt.url}
                alt="Receipt"
                className="w-full max-h-96 object-contain rounded-lg border cursor-pointer"
                onClick={() => setIsReceiptModalOpen(true)}
              />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    {expense.receipt.fileName}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.open(expense.receipt.url, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Uploaded: {formatDate(expense.receipt.uploadedAt)}</p>
              <p>File: {expense.receipt.fileName}</p>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileX className="h-8 w-8 mx-auto mb-2" />
              <p>No receipt attached</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3. Approval Status Section

```tsx
function ApprovalStatusSection({ expense }: { expense: Expense }) {
  if (expense.status === "DRAFT") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Expense is in draft status</p>
            <p className="text-sm text-gray-500 mt-1">
              Submit for approval to start the workflow
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expense.approvals.map((approval, index) => (
            <div
              key={approval.id}
              className={cn(
                "flex items-center space-x-4 p-3 rounded-lg border",
                approval.status === "PENDING" &&
                  "bg-orange-50 border-orange-200",
                approval.status === "APPROVED" &&
                  "bg-green-50 border-green-200",
                approval.status === "REJECTED" && "bg-red-50 border-red-200"
              )}
            >
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={approval.approver.avatar}
                    alt={approval.approver.name}
                  />
                  <AvatarFallback>{approval.approver.initials}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {approval.approver.name}
                  </p>
                  <ApprovalStatusIcon status={approval.status} />
                </div>
                <p className="text-sm text-gray-500">
                  {approval.approver.role}
                </p>
                {approval.comments && (
                  <p className="text-sm text-gray-700 mt-1">
                    "{approval.comments}"
                  </p>
                )}
                {approval.processedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(approval.processedAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Responsive Design and Mobile Optimization

### Mobile Layout (< 768px)

#### 1. Stacked Cards Layout

```tsx
// Replace table with card-based layout on mobile
<div className="space-y-4 md:hidden">
  {expenses.map((expense) => (
    <ExpenseCard key={expense.id} expense={expense} />
  ))}
</div>;

function ExpenseCard({ expense }: { expense: Expense }) {
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        {/* Receipt Thumbnail */}
        <div className="flex-shrink-0">
          {expense.receipt ? (
            <img
              src={expense.receipt.url}
              alt="Receipt"
              className="h-12 w-12 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-12 w-12 bg-gray-100 rounded-lg border border-dashed flex items-center justify-center">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Expense Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {expense.description}
            </h3>
            <ExpenseStatusBadge status={expense.status} />
          </div>

          <div className="space-y-1 text-sm text-gray-500">
            <p>{formatDate(expense.expenseDate)}</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            <Badge variant="outline" className="text-xs">
              {expense.category.name}
            </Badge>
          </div>

          {expense.status === "PENDING_APPROVAL" && (
            <div className="mt-2">
              <ApprovalProgress expense={expense} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Same menu items as desktop */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
```

#### 2. Mobile-Optimized Form

```tsx
// Stack form fields vertically on mobile
<div className="grid grid-cols-1 gap-4">
  {/* All form fields in single column */}
  <div className="space-y-4">
    {/* Description field */}
    {/* Date field */}
    {/* Category field */}
    {/* Amount field */}
    {/* Currency field */}
    {/* Remarks field */}
  </div>
</div>
```

### Touch Interactions

#### 1. Swipe Actions for Mobile

```tsx
// Implement swipe-to-action for expense cards
<div
  className="relative overflow-hidden"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  <ExpenseCard expense={expense} />

  {/* Swipe Actions Background */}
  <div className="absolute inset-y-0 right-0 flex items-center bg-blue-500 text-white px-4">
    <Eye className="h-5 w-5" />
  </div>
</div>
```

#### 2. Large Touch Targets

- Minimum 44px touch targets for all interactive elements
- Increased button sizes on mobile
- Enhanced spacing between clickable elements

---

## Performance Optimization

### 1. Virtual Scrolling for Large Lists

```tsx
import { FixedSizeList as List } from "react-window";

function VirtualizedExpenseTable({ expenses }: { expenses: Expense[] }) {
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => (
    <div style={style}>
      <ExpenseTableRow expense={expenses[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={expenses.length}
      itemSize={80}
      className="border rounded-lg"
    >
      {Row}
    </List>
  );
}
```

### 2. Image Optimization

```tsx
// Lazy loading for receipt thumbnails
<img
  src={expense.receipt.url}
  alt="Receipt"
  className="h-12 w-12 object-cover rounded-lg border"
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = "/placeholder-receipt.png";
  }}
/>
```

### 3. Data Fetching Optimization

```tsx
// Implement pagination and infinite scroll
const {
  data: expenses,
  isLoading,
  isError,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ["expenses", filters],
  queryFn: fetchExpenses,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

---

## Accessibility Considerations

### 1. Screen Reader Support

- Proper ARIA labels for all interactive elements
- Table headers associated with data cells
- Status announcements for form submissions
- Alternative text for all images

### 2. Keyboard Navigation

- Full keyboard accessibility for all features
- Logical tab order through forms and tables
- Keyboard shortcuts for common actions
- Focus management in modals

### 3. Color and Contrast

- High contrast ratios for all text
- Color-blind friendly status indicators
- Multiple visual cues beyond color
- Respect for reduced motion preferences

## Security Considerations

### 1. File Upload Security

- File type validation on client and server
- File size limits (10MB maximum)
- Virus scanning for uploaded files
- Secure file storage with access controls

### 2. Data Protection

- Input sanitization for all form fields
- XSS prevention in user-generated content
- Secure API endpoints with proper authentication
- Audit logging for all expense operations

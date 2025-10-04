# Component Library Documentation

## Overview

This document provides comprehensive specifications for all reusable UI components used throughout the Expense-Wise application. Each component is built using shadcn/ui as the foundation with custom enhancements for business-specific functionality.

### Related Documentation

- [Design System](./design-system.md) - Foundation colors, typography, and spacing
- [Authentication Pages](./authentication-pages.md) - Form component usage examples
- [Admin Dashboard](./admin-dashboard.md) - Advanced table and management components
- [Employee Dashboard](./employee-dashboard.md) - Expense-specific component implementations
- [Manager Dashboard](./manager-dashboard.md) - Approval workflow components

---

## Component Architecture

### Base Framework

- **Foundation**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom design tokens
- **State Management**: React hooks with TypeScript
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React

### Component Categories

1. **Form Components** - Input fields, selectors, validation
2. **Data Display** - Tables, cards, lists, charts
3. **Navigation** - Menus, breadcrumbs, pagination
4. **Feedback** - Alerts, toasts, loading states
5. **Overlays** - Modals, tooltips, popovers
6. **Business Components** - Expense-specific UI elements

---

## Section 1: Form Components

### 1. Enhanced Input Component

#### Purpose

Extended input field with validation, currency formatting, and file upload support.

#### Properties

```tsx
interface EnhancedInputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "currency" | "file";
  value?: string | number;
  onChange?: (value: string | number | File) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  currency?: string;
  accept?: string; // For file inputs
  maxSize?: number; // For file inputs in MB
  icon?: React.ReactNode;
  helpText?: string;
  className?: string;
}
```

#### Implementation

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function EnhancedInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  currency = "USD",
  accept,
  maxSize = 5,
  icon,
  helpText,
  className,
  ...props
}: EnhancedInputProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCurrencyFormat = (val: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = val.replace(/[^0-9.]/g, "");
    const formattedValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(parseFloat(numericValue) || 0);

    return formattedValue;
  };

  const handleFileUpload = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    onChange?.(file);
    return null;
  };

  if (type === "file") {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
            error && "border-red-300 bg-red-50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
          }}
        >
          <Input
            type="file"
            accept={accept}
            className="hidden"
            id="file-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            disabled={disabled}
          />

          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-2">
              {icon || <Upload className="h-8 w-8 mx-auto text-gray-400" />}
              <p className="text-sm text-gray-600">
                {placeholder || "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">
                {accept} (max {maxSize}MB)
              </p>
            </div>
          </Label>
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}

        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <Input
          type={type === "currency" ? "text" : type}
          placeholder={placeholder}
          value={
            type === "currency"
              ? handleCurrencyFormat(String(internalValue))
              : internalValue
          }
          onChange={(e) => {
            const newValue = e.target.value;
            setInternalValue(newValue);

            if (type === "currency") {
              const numericValue =
                parseFloat(newValue.replace(/[^0-9.]/g, "")) || 0;
              onChange?.(numericValue);
            } else {
              onChange?.(newValue);
            }
          }}
          className={cn(
            icon && "pl-10",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            "transition-colors"
          )}
          disabled={disabled}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}

      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
```

#### Usage Examples

```tsx
// Basic text input
<EnhancedInput
  label="Description"
  placeholder="Enter expense description"
  required
  value={description}
  onChange={setDescription}
  error={errors.description}
/>

// Currency input
<EnhancedInput
  label="Amount"
  type="currency"
  currency="USD"
  value={amount}
  onChange={setAmount}
  icon={<DollarSign className="h-4 w-4" />}
  required
/>

// File upload
<EnhancedInput
  label="Receipt"
  type="file"
  accept="image/*,.pdf"
  maxSize={10}
  onChange={setReceiptFile}
  placeholder="Upload receipt image or PDF"
  helpText="Supported formats: JPG, PNG, PDF (max 10MB)"
/>
```

### 2. Multi-Select Component

#### Purpose

Advanced multi-select dropdown with search, filtering, and custom rendering.

#### Properties

```tsx
interface MultiSelectProps<T> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  maxSelected?: number;
  renderOption?: (option: T) => React.ReactNode;
  renderSelected?: (option: T) => React.ReactNode;
  className?: string;
}
```

#### Implementation

```tsx
export function MultiSelect<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  disabled = false,
  maxSelected,
  renderOption,
  renderSelected,
  className,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: T) => {
    const isSelected = value.some(
      (v) => getOptionValue(v) === getOptionValue(option)
    );

    if (isSelected) {
      onChange(
        value.filter((v) => getOptionValue(v) !== getOptionValue(option))
      );
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, option]);
    }
  };

  const removeOption = (option: T) => {
    onChange(value.filter((v) => getOptionValue(v) !== getOptionValue(option)));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "w-full justify-between min-h-10 h-auto p-2",
            value.length === 0 && "text-gray-500",
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length === 0 ? (
              placeholder
            ) : (
              <>
                {value.slice(0, 2).map((option) => (
                  <Badge
                    key={getOptionValue(option)}
                    variant="secondary"
                    className="text-xs"
                  >
                    {renderSelected
                      ? renderSelected(option)
                      : getOptionLabel(option)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(option);
                      }}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
                {value.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{value.length - 2} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => {
              const isSelected = value.some(
                (v) => getOptionValue(v) === getOptionValue(option)
              );

              return (
                <CommandItem
                  key={getOptionValue(option)}
                  onSelect={() => handleSelect(option)}
                  className="cursor-pointer"
                >
                  <Checkbox checked={isSelected} className="mr-2" />
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div className="flex-1">{getOptionLabel(option)}</div>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          {value.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
                className="w-full text-xs"
              >
                Clear all ({value.length})
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

#### Usage Examples

```tsx
// Category multi-select
<MultiSelect
  options={categories}
  value={selectedCategories}
  onChange={setSelectedCategories}
  getOptionLabel={(cat) => cat.name}
  getOptionValue={(cat) => cat.id}
  placeholder="Select categories"
  maxSelected={5}
  renderOption={(cat) => (
    <div className="flex items-center space-x-2">
      <div className={`h-3 w-3 rounded-full bg-${cat.color}-500`} />
      <span>{cat.name}</span>
      <Badge variant="outline" className="ml-auto text-xs">
        {cat.expenseCount}
      </Badge>
    </div>
  )}
/>
```

---

## Section 2: Data Display Components

### 1. Advanced Data Table

#### Purpose

Feature-rich table with sorting, filtering, pagination, and selection.

#### Properties

```tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (sortBy: string, order: "asc" | "desc") => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selected: string[]) => void;
    getRowId: (row: T) => string;
  };
  filters?: TableFilter[];
  emptyMessage?: string;
  className?: string;
}

interface ColumnDef<T> {
  key: string;
  header: string | React.ReactNode;
  accessor: (row: T) => any;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  sticky?: "left" | "right";
}
```

#### Implementation

```tsx
export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  selection,
  filters,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<string[]>(
    selection?.selectedRows || []
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map((row) => selection?.getRowId(row) || "");
      setSelectedRows(allIds);
      selection?.onSelectionChange(allIds);
    } else {
      setSelectedRows([]);
      selection?.onSelectionChange([]);
    }
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    let newSelection: string[];

    if (checked) {
      newSelection = [...selectedRows, rowId];
    } else {
      newSelection = selectedRows.filter((id) => id !== rowId);
    }

    setSelectedRows(newSelection);
    selection?.onSelectionChange(newSelection);
  };

  const handleSort = (columnKey: string) => {
    if (!sorting) return;

    const newOrder =
      sorting.sortBy === columnKey && sorting.sortOrder === "asc"
        ? "desc"
        : "asc";

    sorting.onSortChange(columnKey, newOrder);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Filters */}
      {filters && <TableFilters filters={filters} />}

      {/* Table Container */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {/* Selection Column */}
              {selection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRows.length === data.length && data.length > 0
                    }
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < data.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}

              {/* Data Columns */}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.width && `w-[${column.width}]`,
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.sticky === "left" && "sticky left-0 bg-gray-50 z-10",
                    column.sticky === "right" &&
                      "sticky right-0 bg-gray-50 z-10"
                  )}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {sorting?.sortBy === column.key && (
                        <span className="ml-1">
                          {sorting.sortOrder === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selection ? 1 : 0)}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="space-y-2">
                    <Database className="h-8 w-8 mx-auto text-gray-400" />
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = selection?.getRowId(row) || String(index);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      isSelected && "bg-blue-50"
                    )}
                  >
                    {/* Selection Column */}
                    {selection && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleRowSelect(rowId, !!checked)
                          }
                          aria-label={`Select row ${index + 1}`}
                        />
                      </TableCell>
                    )}

                    {/* Data Columns */}
                    {columns.map((column) => {
                      const value = column.accessor(row);

                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                            column.sticky === "left" &&
                              "sticky left-0 bg-white z-10",
                            column.sticky === "right" &&
                              "sticky right-0 bg-white z-10"
                          )}
                        >
                          {column.cell ? column.cell(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}

      {/* Selection Summary */}
      {selection && selectedRows.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            {selectedRows.length} item(s) selected
          </p>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              Export Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSelectAll(false)}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2. Expense Card Component

#### Purpose

Specialized card component for displaying expense information with status, actions, and detailed metadata.

#### Properties

```tsx
interface ExpenseCardProps {
  expense: Expense;
  variant?: "default" | "compact" | "detailed";
  actions?: ExpenseAction[];
  onAction?: (action: string, expense: Expense) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  showCurrencyConversion?: boolean;
  baseCurrency?: string;
  className?: string;
}

interface ExpenseAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
  disabled?: boolean;
}
```

#### Implementation

```tsx
export function ExpenseCard({
  expense,
  variant = "default",
  actions = [],
  onAction,
  isSelected = false,
  onSelect,
  showCurrencyConversion = true,
  baseCurrency = "USD",
  className,
}: ExpenseCardProps) {
  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-100";
      case "REJECTED":
        return "text-red-600 bg-red-100";
      case "PENDING":
        return "text-orange-600 bg-orange-100";
      case "DRAFT":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (variant === "compact") {
    return (
      <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onSelect && (
              <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            )}

            <div className="flex-1">
              <p className="font-medium text-gray-900 truncate">
                {expense.description}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(expense.expenseDate)} • {expense.category.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-bold text-gray-900">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            <Badge className={cn("text-xs", getStatusColor(expense.status))}>
              {expense.status}
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{expense.description}</CardTitle>
              <CardDescription>
                Submitted by {expense.submitter.name} on{" "}
                {formatDate(expense.createdAt)}
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={cn("text-xs", getStatusColor(expense.status))}>
                {expense.status}
              </Badge>

              {expense.priority === "urgent" && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Amount
              </Label>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(expense.amount, expense.currency)}
                </p>

                {showCurrencyConversion &&
                  expense.currency !== baseCurrency && (
                    <p className="text-sm text-blue-600 font-medium">
                      ≈ {formatCurrency(expense.convertedAmount, baseCurrency)}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">
                Category
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className={`h-3 w-3 rounded-full bg-${expense.category.color}-500`}
                />
                <span className="text-sm font-medium">
                  {expense.category.name}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt */}
          {expense.receipt && (
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Receipt
              </Label>
              <div className="mt-2 flex items-center space-x-3">
                <img
                  src={expense.receipt.thumbnailUrl}
                  alt="Receipt"
                  className="h-16 w-16 object-cover rounded-lg border"
                />
                <div>
                  <p className="text-sm font-medium">
                    {expense.receipt.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {expense.receipt.fileSize} • Uploaded{" "}
                    {formatRelativeTime(expense.receipt.uploadedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {expense.remarks && (
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Remarks
              </Label>
              <p className="text-sm text-gray-900 mt-1">{expense.remarks}</p>
            </div>
          )}

          {/* Approval Flow */}
          {expense.approvals && expense.approvals.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Approval Status
              </Label>
              <div className="mt-2 space-y-2">
                {expense.approvals.map((approval, index) => (
                  <div
                    key={approval.id}
                    className="flex items-center space-x-3"
                  >
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                        approval.status === "APPROVED" &&
                          "bg-green-100 text-green-600",
                        approval.status === "REJECTED" &&
                          "bg-red-100 text-red-600",
                        approval.status === "PENDING" &&
                          "bg-orange-100 text-orange-600"
                      )}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {approval.approver.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {approval.approver.role}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge
                        className={cn(
                          "text-xs",
                          getStatusColor(approval.status)
                        )}
                      >
                        {approval.status}
                      </Badge>
                      {approval.approvedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(approval.approvedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {actions.length > 0 && (
          <CardFooter className="bg-gray-50 border-t">
            <div className="flex space-x-2 w-full">
              {actions.map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant || "default"}
                  size="sm"
                  disabled={action.disabled}
                  onClick={() => onAction?.(action.key, expense)}
                  className="flex-1"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        "p-4 hover:shadow-md transition-shadow cursor-pointer",
        isSelected && "ring-2 ring-blue-500 bg-blue-50",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
            )}

            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                {expense.description}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(expense.expenseDate)}</span>
                <Badge variant="outline" className="text-xs">
                  {expense.category.name}
                </Badge>
              </div>
            </div>
          </div>

          <Badge className={cn("text-xs", getStatusColor(expense.status))}>
            {expense.status}
          </Badge>
        </div>

        {/* Amount */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(expense.amount, expense.currency)}
            </p>

            {showCurrencyConversion && expense.currency !== baseCurrency && (
              <p className="text-sm text-blue-600">
                ≈ {formatCurrency(expense.convertedAmount, baseCurrency)}
              </p>
            )}
          </div>

          {expense.receipt && (
            <div className="flex items-center text-xs text-green-600">
              <Paperclip className="h-3 w-3 mr-1" />
              Receipt attached
            </div>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex space-x-2 pt-2 border-t">
            {actions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || "outline"}
                size="sm"
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.(action.key, expense);
                }}
                className="flex-1"
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
```

#### Usage Examples

```tsx
// Default expense card
<ExpenseCard
  expense={expense}
  actions={[
    { key: 'edit', label: 'Edit', icon: <Edit className="h-4 w-4" /> },
    { key: 'delete', label: 'Delete', icon: <Trash className="h-4 w-4" />, variant: 'destructive' }
  ]}
  onAction={handleExpenseAction}
  isSelected={selectedExpenses.includes(expense.id)}
  onSelect={(selected) => handleExpenseSelect(expense.id, selected)}
/>

// Compact list view
<ExpenseCard
  expense={expense}
  variant="compact"
  showCurrencyConversion={false}
/>

// Detailed modal view
<ExpenseCard
  expense={expense}
  variant="detailed"
  actions={[
    { key: 'approve', label: 'Approve', icon: <Check className="h-4 w-4" /> },
    { key: 'reject', label: 'Reject', icon: <X className="h-4 w-4" />, variant: 'destructive' }
  ]}
  onAction={handleApprovalAction}
/>
```

---

## Section 3: Navigation Components

### 1. Breadcrumb Navigation

#### Purpose

Hierarchical navigation component with dropdown support for long paths.

#### Implementation

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  dropdown?: BreadcrumbItem[];
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

export function BreadcrumbNavigation({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems = 4,
  className,
}: BreadcrumbProps) {
  const shouldCollapse = items.length > maxItems;
  const displayItems = shouldCollapse
    ? [items[0], ...items.slice(-(maxItems - 2))]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1", className)}
    >
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">{separator}</span>}

          {/* Collapsed indicator */}
          {shouldCollapse && index === 1 && items.length > maxItems && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {items
                    .slice(1, -(maxItems - 2))
                    .map((hiddenItem, hiddenIndex) => (
                      <DropdownMenuItem key={hiddenIndex} asChild>
                        <Link href={hiddenItem.href || "#"}>
                          {hiddenItem.icon && (
                            <span className="mr-2">{hiddenItem.icon}</span>
                          )}
                          {hiddenItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-gray-400">{separator}</span>
            </>
          )}

          {/* Regular breadcrumb item */}
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center text-sm font-medium text-gray-900">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

### 2. Pagination Component

#### Purpose

Advanced pagination with page size selector and jump-to-page functionality.

#### Implementation

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showPageSizeSelector?: boolean;
  showPageJump?: boolean;
  showItemsInfo?: boolean;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showPageJump = true,
  showItemsInfo = true,
  className,
}: PaginationProps) {
  const [jumpToPage, setJumpToPage] = useState("");

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= delta + 1) {
      for (let i = 1; i <= Math.min(delta + 3, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > delta + 3) {
        pages.push("...");
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - delta) {
      pages.push(1);
      if (totalPages - delta - 2 > 1) {
        pages.push("...");
      }
      for (let i = Math.max(totalPages - delta - 1, 1); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - delta; i <= currentPage + delta; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage("");
    }
  };

  return (
    <div
      className={cn("flex items-center justify-between space-x-4", className)}
    >
      {/* Items info */}
      {showItemsInfo && (
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      {/* Page size selector */}
      {showPageSizeSelector && (
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Show:</Label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First/Previous buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => onPageChange(Number(page))}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next/Last buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Jump to page */}
      {showPageJump && (
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Go to:</Label>
          <div className="flex space-x-1">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
              className="w-16 h-8"
              placeholder="Page"
            />
            <Button size="sm" onClick={handleJumpToPage}>
              Go
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Section 4: Feedback Components

### 1. Toast Notification System

#### Purpose

Global toast notification system with different types and actions.

#### Implementation

```tsx
interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
}

export function ToastNotification({
  id,
  type,
  title,
  description,
  action,
  duration = 5000,
  persistent = false,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (persistent) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 100);
        if (newProgress <= 0) {
          setIsVisible(false);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [duration, persistent]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: "text-green-800",
          description: "text-green-700",
          progress: "bg-green-500",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200",
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          title: "text-red-800",
          description: "text-red-700",
          progress: "bg-red-500",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200",
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          title: "text-yellow-800",
          description: "text-yellow-700",
          progress: "bg-yellow-500",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200",
          icon: <Info className="h-5 w-5 text-blue-600" />,
          title: "text-blue-800",
          description: "text-blue-700",
          progress: "bg-blue-500",
        };
    }
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
        styles.container
      )}
    >
      <div className="flex items-start space-x-3">
        {styles.icon}

        <div className="flex-1 min-w-0">
          <h4 className={cn("text-sm font-medium", styles.title)}>{title}</h4>

          {description && (
            <p className={cn("mt-1 text-sm", styles.description)}>
              {description}
            </p>
          )}

          {action && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className={styles.title}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!persistent && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className={cn("h-full transition-all", styles.progress)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

### 2. Loading States Component

#### Purpose

Versatile loading component with different styles and content types.

#### Implementation

```tsx
interface LoadingStateProps {
  type?: "spinner" | "skeleton" | "pulse" | "dots";
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export function LoadingState({
  type = "spinner",
  size = "md",
  text,
  fullScreen = false,
  overlay = false,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const renderLoader = () => {
    switch (type) {
      case "spinner":
        return (
          <div className="flex flex-col items-center space-y-2">
            <div
              className={cn(
                "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
                sizeClasses[size]
              )}
            />
            {text && <p className="text-sm text-gray-600">{text}</p>}
          </div>
        );

      case "dots":
        return (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full bg-blue-600 animate-pulse",
                    size === "sm" && "h-1 w-1",
                    size === "md" && "h-2 w-2",
                    size === "lg" && "h-3 w-3"
                  )}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
            {text && <p className="text-sm text-gray-600">{text}</p>}
          </div>
        );

      case "pulse":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
            </div>
            {text && <p className="text-sm text-gray-600">{text}</p>}
          </div>
        );

      case "skeleton":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          </div>
        );
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "min-h-screen",
        className
      )}
    >
      {renderLoader()}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">{content}</div>
      </div>
    );
  }

  return content;
}
```

---

## Section 5: Accessibility and Testing

### Accessibility Guidelines

#### 1. Keyboard Navigation

```tsx
// Ensure all interactive elements are keyboard accessible
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter":
    case " ":
      event.preventDefault();
      handleAction();
      break;
    case "Escape":
      handleClose();
      break;
    case "ArrowUp":
    case "ArrowDown":
      // Handle list navigation
      break;
  }
};
```

#### 2. Screen Reader Support

```tsx
// Use semantic HTML and ARIA attributes
<button
  aria-label="Approve expense for $123.45 from John Doe"
  aria-describedby="expense-details"
  onClick={handleApprove}
>
  Approve
</button>

<div id="expense-details" className="sr-only">
  Expense submitted on March 15th for office supplies
</div>
```

#### 3. Focus Management

```tsx
// Manage focus for modals and dynamic content
useEffect(() => {
  if (isOpen && modalRef.current) {
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }
}, [isOpen]);
```

### Testing Utilities

#### 1. Component Testing

```tsx
// Test utility for component interactions
export const renderWithProviders = (
  component: React.ReactElement,
  options: RenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

// Example test
test("expense card displays correct information", () => {
  const expense = mockExpense();

  renderWithProviders(<ExpenseCard expense={expense} onAction={jest.fn()} />);

  expect(screen.getByText(expense.description)).toBeInTheDocument();
  expect(screen.getByText(`$${expense.amount}`)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
});
```

#### 2. Accessibility Testing

```tsx
// Automated accessibility testing
test("expense card is accessible", async () => {
  const { container } = renderWithProviders(
    <ExpenseCard expense={mockExpense()} />
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

This component library documentation provides a comprehensive foundation for building consistent, accessible, and maintainable UI components throughout the Expense-Wise application.

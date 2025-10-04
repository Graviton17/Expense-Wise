"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate } from "@/lib/utils";
import { 
  Upload, 
  X, 
  FileText, 
  Save, 
  Send, 
  CheckCircle, 
  Loader2,
  CalendarIcon,
  Receipt,
  DollarSign,
  Tag,
  FileCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ExpenseSubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseCurrency: string;
  editingExpense?: unknown;
}

const mockCategories = [
  { id: "1", name: "Travel", icon: "✈️" },
  { id: "2", name: "Meals & Entertainment", icon: "🍽️" },
  { id: "3", name: "Office Supplies", icon: "📦" },
  { id: "4", name: "Software & Subscriptions", icon: "💻" },
  { id: "5", name: "Training & Development", icon: "📚" },
  { id: "6", name: "Transportation", icon: "🚗" },
  { id: "7", name: "Client Meetings", icon: "🤝" },
  { id: "8", name: "Equipment", icon: "🔧" },
];

const supportedCurrencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export function ExpenseSubmitModal({ open, onOpenChange, baseCurrency, editingExpense }: ExpenseSubmitModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResults, setOcrResults] = useState<{
    confidence: number;
    description?: string;
    amount?: number;
    date?: Date;
  } | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    expenseDate: new Date(),
    categoryId: "",
    amount: "",
    currency: baseCurrency,
    remarks: "",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setReceiptFile(file);
    setIsProcessingOCR(true);

    // Simulate OCR processing
    setTimeout(() => {
      setOcrResults({
        confidence: 0.85,
        description: "Business lunch at restaurant",
        amount: 120.50,
        date: new Date(),
      });
      setIsProcessingOCR(false);
    }, 2000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setOcrResults(null);
  };

  const handleApplyOCRResults = () => {
    if (ocrResults) {
      setFormData({
        ...formData,
        description: ocrResults.description || formData.description,
        amount: ocrResults.amount?.toString() || formData.amount,
        expenseDate: ocrResults.date || formData.expenseDate,
      });
      setOcrResults(null);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting expense:", formData);
    onOpenChange(false);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      description: "",
      expenseDate: new Date(),
      categoryId: "",
      amount: "",
      currency: baseCurrency,
      remarks: "",
    });
    setReceiptFile(null);
    setOcrResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-white">
                  {editingExpense ? "Edit Expense" : "New Expense"}
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-base mt-1">
                  {editingExpense ? "Update your expense details" : "Submit a new expense claim"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Receipt Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Receipt</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
              </div>

              {!receiptFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
                    isDragActive
                      ? "border-blue-500 bg-blue-50 scale-[1.02]"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl mx-auto flex items-center justify-center">
                      <Upload className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-900 mb-2">
                        {isDragActive ? "Drop your receipt here" : "Upload Receipt"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Drag and drop or click to browse
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">JPG</span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">PNG</span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">PDF</span>
                      <span className="text-xs text-gray-500">• Max 10MB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                    {receiptFile.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(receiptFile)}
                        alt="Receipt preview"
                        className="w-full h-64 object-contain"
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-base font-medium text-gray-700">{receiptFile.name}</p>
                          <p className="text-sm text-gray-500 mt-2">{(receiptFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveReceipt}
                      className="absolute top-4 right-4 shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {isProcessingOCR && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Processing receipt with AI...
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Extracting expense details automatically
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {ocrResults && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">
                              Receipt processed successfully!
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Found: {ocrResults.description} • ${ocrResults.amount}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleApplyOCRResults}
                          className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Expense Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Expense Details</h3>
              </div>

              <div className="grid gap-6">
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Business lunch with client"
                    className="h-12 text-base"
                  />
                </div>

                {/* Date and Category */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 text-base",
                            !formData.expenseDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          {formData.expenseDate ? formatDate(formData.expenseDate) : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.expenseDate}
                          onSelect={(date) => date && setFormData({ ...formData, expenseDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(categoryId) => setFormData({ ...formData, categoryId })}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <span className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold text-gray-900">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        className="h-12 text-xl font-semibold pl-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">
                      Currency <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(currency) => setFormData({ ...formData, currency })}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center gap-2">
                              <span className="font-semibold">{currency.symbol}</span>
                              <span>{currency.code}</span>
                              <span className="text-gray-500">- {currency.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-sm font-semibold text-gray-900">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Add any additional context or notes..."
                    rows={4}
                    className="resize-none text-base"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Before submitting</p>
                  <p className="text-blue-700">Make sure all required fields are filled and your receipt is attached for faster approval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {isProcessingOCR && (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel} className="h-11">
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} className="h-11">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

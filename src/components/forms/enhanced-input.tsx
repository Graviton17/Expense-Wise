"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, Upload, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedInputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "currency" | "file";
  value?: string | number | File;
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
  id?: string;
  name?: string;
  autoComplete?: string;
}

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
  id,
  name,
  autoComplete,
  ...props
}: EnhancedInputProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(
    value instanceof File ? value : null
  );

  const handleCurrencyFormat = useCallback((val: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(numericValue) || 0;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(parsed);
  }, [currency]);

  const handleFileUpload = useCallback((file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    setUploadedFile(file);
    onChange?.(file);
    return null;
  }, [maxSize, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const error = handleFileUpload(file);
      if (error) {
        // Handle error - could set error state here
        console.error(error);
      }
    }
  }, [handleFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = handleFileUpload(file);
      if (error) {
        // Handle error - could set error state here
        console.error(error);
      }
    }
  }, [handleFileUpload]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    onChange?.(undefined as any);
  }, [onChange]);

  const handleReplaceFile = useCallback(() => {
    // Trigger file input click
    const fileInput = document.getElementById(`${id}-file-input`) as HTMLInputElement;
    fileInput?.click();
  }, [id]);

  // File upload variant
  if (type === "file") {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {!uploadedFile ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              error && "border-red-300 bg-red-50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={accept}
              className="hidden"
              id={`${id}-file-input`}
              onChange={handleFileInputChange}
              disabled={disabled}
            />

            <Label htmlFor={`${id}-file-input`} className="cursor-pointer">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                  {icon || <Upload className="h-6 w-6 text-gray-400" />}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragOver ? "Drop file here" : (placeholder || "Upload file")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag and drop your file or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {accept} (max {maxSize}MB)
                  </p>
                </div>
              </div>
            </Label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Preview */}
            <div className="relative border rounded-lg p-4">
              {uploadedFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="File preview"
                  className="w-full max-h-64 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleReplaceFile}
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveFile}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

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

  // Regular input variants
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
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
          id={id}
          name={name}
          type={type === "currency" ? "text" : type}
          placeholder={placeholder}
          value={
            type === "currency" && typeof internalValue === "string"
              ? handleCurrencyFormat(internalValue)
              : internalValue
          }
          onChange={(e) => {
            const newValue = e.target.value;
            setInternalValue(newValue);

            if (type === "currency") {
              const numericValue = parseFloat(newValue.replace(/[^0-9.]/g, "")) || 0;
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
          autoComplete={autoComplete}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center" role="alert">
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
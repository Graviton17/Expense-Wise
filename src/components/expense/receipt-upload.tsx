import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReceiptUploadProps {
  onFilesAccepted?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  isProcessing?: boolean;
}

const ReceiptUpload: FC<ReceiptUploadProps> = ({
  onFilesAccepted,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ["image/*", "application/pdf"],
  isProcessing = false,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted?.(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled: isProcessing,
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Receipt Upload
            </h3>
            <p className="text-sm text-gray-500">
              Upload receipts for OCR processing and automatic data extraction
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />

            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 text-gray-400">
                {/* Upload icon */}
                <svg
                  className="h-full w-full"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  {isDragActive ? (
                    "Drop the files here..."
                  ) : (
                    <>
                      <span className="font-medium text-blue-600">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to {Math.round(maxSize / 1024 / 1024)}MB (max{" "}
                  {maxFiles} files)
                </p>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-sm text-gray-600">
                  Processing with OCR...
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Supports automatic data extraction</span>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              Browse Files
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptUpload;

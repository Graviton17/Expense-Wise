import { uploadFile, generateSignedUrl } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { queueOCRJob } from "@/lib/queue";
import {
  Receipt,
  ReceiptPublic,
  ReceiptStatus,
  ServiceResult,
  FileMetadata,
} from "@/types";
import { businessLogger } from "@/middleware/logger";
import { businessMetrics } from "@/middleware/metrics";

export class ReceiptService {
  // Upload receipt file
  static async uploadReceipt(
    file: File,
    expenseId: string,
    userId: string
  ): Promise<ServiceResult<ReceiptPublic>> {
    try {
      // Generate S3 key
      const timestamp = Date.now();
      const s3Key = `receipts/${expenseId}/${timestamp}-${file.name}`;

      // Upload to S3
      const uploadResult = await uploadFile(file, {
        key: s3Key,
        contentType: file.type,
        metadata: {
          expenseId,
          userId,
          originalName: file.name,
        },
      });

      // Create receipt record
      const receipt = await prisma.receipt.create({
        data: {
          expenseId,
          userId,
          fileName: `${timestamp}-${file.name}`,
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          s3Key,
          s3Url: uploadResult.url,
          status: "PROCESSING" as ReceiptStatus,
        },
      });

      // Queue OCR processing
      await queueOCRJob({
        receiptId: receipt.id,
        s3Key,
        userId,
        expenseId,
      });

      // Record metrics
      businessMetrics.fileUploaded(file.size, file.type);

      businessLogger.logUserAction("receipt_uploaded", userId, {
        receiptId: receipt.id,
        expenseId,
        fileName: file.name,
        fileSize: file.size,
      });

      return {
        success: true,
        data: this.toPublicReceipt(receipt),
      };
    } catch (error) {
      businessLogger.error("Failed to upload receipt", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to upload receipt",
          code: "RECEIPT_UPLOAD_FAILED",
        },
      };
    }
  }

  // Get receipt by ID
  static async getReceiptById(
    id: string
  ): Promise<ServiceResult<ReceiptPublic>> {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id },
        include: {
          expense: true,
          user: true,
        },
      });

      if (!receipt) {
        return {
          success: false,
          error: {
            message: "Receipt not found",
            code: "RECEIPT_NOT_FOUND",
          },
        };
      }

      return {
        success: true,
        data: this.toPublicReceipt(receipt),
      };
    } catch (error) {
      businessLogger.error("Failed to get receipt", error as Error, {
        receiptId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to retrieve receipt",
          code: "RECEIPT_FETCH_FAILED",
        },
      };
    }
  }

  // Get receipts for an expense
  static async getReceiptsForExpense(
    expenseId: string
  ): Promise<ServiceResult<ReceiptPublic[]>> {
    try {
      const receipts = await prisma.receipt.findMany({
        where: { expenseId },
        orderBy: {
          createdAt: "asc",
        },
      });

      const receiptPublics = receipts.map((receipt) =>
        this.toPublicReceipt(receipt)
      );

      return {
        success: true,
        data: receiptPublics,
      };
    } catch (error) {
      businessLogger.error(
        "Failed to get receipts for expense",
        error as Error,
        { expenseId }
      );
      return {
        success: false,
        error: {
          message: "Failed to retrieve receipts",
          code: "RECEIPTS_FETCH_FAILED",
        },
      };
    }
  }

  // Generate signed URL for receipt download
  static async getReceiptDownloadUrl(
    receiptId: string,
    userId: string
  ): Promise<ServiceResult<{ url: string; expiresIn: number }>> {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId },
      });

      if (!receipt) {
        return {
          success: false,
          error: {
            message: "Receipt not found",
            code: "RECEIPT_NOT_FOUND",
          },
        };
      }

      // Generate signed URL (expires in 1 hour)
      const signedUrl = await generateSignedUrl({
        key: receipt.s3Key,
        expires: 3600, // 1 hour
      });

      businessLogger.logDataAccess("receipt", "download", userId, receiptId);

      return {
        success: true,
        data: {
          url: signedUrl,
          expiresIn: 3600,
        },
      };
    } catch (error) {
      businessLogger.error("Failed to generate download URL", error as Error, {
        receiptId,
      });
      return {
        success: false,
        error: {
          message: "Failed to generate download URL",
          code: "URL_GENERATION_FAILED",
        },
      };
    }
  }

  // Update receipt OCR data
  static async updateReceiptOCR(
    receiptId: string,
    ocrData: any,
    status: ReceiptStatus
  ): Promise<ServiceResult<ReceiptPublic>> {
    try {
      const receipt = await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          ocrData,
          status,
        },
      });

      businessLogger.logSystemEvent("receipt_ocr_processed", {
        receiptId,
        status,
        hasData: !!ocrData,
      });

      return {
        success: true,
        data: this.toPublicReceipt(receipt),
      };
    } catch (error) {
      businessLogger.error("Failed to update receipt OCR", error as Error, {
        receiptId,
      });
      return {
        success: false,
        error: {
          message: "Failed to update receipt OCR data",
          code: "RECEIPT_OCR_UPDATE_FAILED",
        },
      };
    }
  }

  // Delete receipt
  static async deleteReceipt(
    receiptId: string,
    userId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId },
      });

      if (!receipt) {
        return {
          success: false,
          error: {
            message: "Receipt not found",
            code: "RECEIPT_NOT_FOUND",
          },
        };
      }

      // Delete from database
      await prisma.receipt.delete({
        where: { id: receiptId },
      });

      // Note: In production, you might want to also delete from S3
      // or mark it for cleanup

      businessLogger.logUserAction("receipt_deleted", userId, {
        receiptId,
        expenseId: receipt.expenseId,
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      businessLogger.error("Failed to delete receipt", error as Error, {
        receiptId,
      });
      return {
        success: false,
        error: {
          message: "Failed to delete receipt",
          code: "RECEIPT_DELETION_FAILED",
        },
      };
    }
  }

  // Get receipts by user
  static async getReceiptsByUser(
    userId: string,
    filters: {
      status?: ReceiptStatus;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<ServiceResult<ReceiptPublic[]>> {
    try {
      const where: any = { userId };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      const receipts = await prisma.receipt.findMany({
        where,
        include: {
          expense: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const receiptPublics = receipts.map((receipt) =>
        this.toPublicReceipt(receipt)
      );

      return {
        success: true,
        data: receiptPublics,
      };
    } catch (error) {
      businessLogger.error("Failed to get receipts by user", error as Error, {
        userId,
      });
      return {
        success: false,
        error: {
          message: "Failed to retrieve receipts",
          code: "RECEIPTS_FETCH_FAILED",
        },
      };
    }
  }

  // Extract data from OCR result and suggest expense updates
  static extractExpenseDataFromOCR(ocrData: any): {
    amount?: number;
    merchantName?: string;
    date?: string;
    confidence: number;
  } {
    try {
      const extracted = {
        amount: ocrData.fields?.amount,
        merchantName: ocrData.fields?.merchant,
        date: ocrData.fields?.date,
        confidence: ocrData.confidence || 0,
      };

      return extracted;
    } catch (error) {
      businessLogger.error(
        "Failed to extract expense data from OCR",
        error as Error
      );
      return { confidence: 0 };
    }
  }

  // Helper method to convert Receipt to ReceiptPublic
  private static toPublicReceipt(receipt: any): ReceiptPublic {
    const { s3Key, ...receiptPublic } = receipt;
    return receiptPublic as ReceiptPublic;
  }
}

export default ReceiptService;

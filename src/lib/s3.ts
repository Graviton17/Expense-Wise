import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || "expense-wise-receipts";

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

// Generate S3 key for file organization
export function generateS3Key(
  companyId: string,
  userId: string,
  filename: string
): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const timestamp = Date.now();

  // Clean filename
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  return `receipts/${companyId}/${year}/${month}/${userId}/${timestamp}-${cleanFilename}`;
}

// Upload file to S3
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string = "application/octet-stream"
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return {
      key,
      url,
      bucket: AWS_S3_BUCKET,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
}

// Get signed URL for file access
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("S3 signed URL error:", error);
    throw new Error("Failed to generate signed URL");
  }
}

// Delete file from S3
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error("Failed to delete file from S3");
  }
}

// Validate file type and size
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type must be JPEG, PNG, or PDF" };
  }

  return { valid: true };
}

// Extract file buffer from File object
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Generate thumbnail key (for future implementation)
export function generateThumbnailKey(originalKey: string): string {
  const keyParts = originalKey.split(".");
  const extension = keyParts.pop();
  const baseKey = keyParts.join(".");

  return `${baseKey}_thumb.${extension}`;
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// Get MIME type from file extension
export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename);

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

export { s3Client };

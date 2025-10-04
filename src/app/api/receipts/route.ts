import { NextRequest, NextResponse } from "next/server";

/**
 * Upload Receipt
 * POST /api/receipts
 * Content-Type: multipart/form-data
 *
 * Form Data:
 * - file: File (required)
 * - expenseId: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const expenseId = formData.get("expenseId") as string;

    // TODO: Implement receipt upload logic
    // - Verify authentication
    // - Validate file (type, size < 10MB)
    // - Check expense ownership
    // - Generate unique filename
    // - Upload file to S3
    // - Create receipt record in database
    // - Enqueue OCR job for processing
    // - Return receipt data with S3 URL

    return NextResponse.json(
      {
        message: "Upload receipt - To be implemented",
        data: { expenseId, filename: file?.name },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload receipt" },
      { status: 500 }
    );
  }
}

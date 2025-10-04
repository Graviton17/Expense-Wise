import { NextRequest, NextResponse } from "next/server";

/**
 * Get OCR Results for Receipt
 * GET /api/receipts/:id/ocr
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Implement get OCR results logic
    // - Verify authentication
    // - Check expense ownership/authorization
    // - Fetch receipt from database
    // - Return OCR data (merchantName, amount, date, lineItems, confidence)
    // - Return processing status if OCR not completed

    return NextResponse.json(
      {
        message: "Get OCR results - To be implemented",
        data: {
          id,
          status: "processing", // or 'completed'
          ocrData: null,
        },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch OCR results" },
      { status: 500 }
    );
  }
}

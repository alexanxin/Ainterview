import { NextRequest, NextResponse } from "next/server";
import { X402PaymentService } from "@/lib/x402-payment-service";
import { Logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { transactionId, expectedAmount, expectedToken } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    Logger.info("Payment verification request received", {
      transactionId,
      expectedAmount,
      expectedToken,
    });

    const x402Service = X402PaymentService.getInstance();

    // Verify the payment using the server-side service
    const result = await x402Service.verifySolanaPayment(
      transactionId,
      expectedAmount,
      expectedToken
    );

    Logger.info("Payment verification completed", {
      transactionId,
      success: result.success,
      creditsAdded: result.creditsAdded,
      error: result.error,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error("Error in payment verification:", { error: errorMessage });

    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { Logger } from "@/lib/logger";
import { paymentVerificationService } from "@/lib/payment-verification-service";
import { supabaseServer } from "@/lib/supabase-server";

// Define the expected webhook payload structure
interface SolanaWebhookPayload {
  id: string;
  transaction: {
    signature: string;
    slot: number;
    blockTime: number;
    meta: {
      fee: number;
      preBalances: number[];
      postBalances: number[];
      err: object | null;
    };
  };
  result: string; // 'processed', 'confirmed', or 'finalized'
}

// Define the payment record interface compatible with enhanced database interface
interface PaymentRecord {
  id: string;
  user_id: string;
  transaction_id: string;
  expected_amount: number;
  token: "USDC" | "USDT" | "CASH";
  recipient: string;
  status: "pending" | "confirmed" | "failed";
  // Security fields (optional for backward compatibility)
  transaction_nonce?: string;
  transaction_timestamp?: string;
  verified_at?: string;
  expires_at?: string;
  processing_locked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: SolanaWebhookPayload = await request.json();

    Logger.info("Solana webhook received:", {
      signature: payload.transaction.signature,
      result: payload.result,
      slot: payload.transaction.slot,
    });

    // Verify this is a valid transaction
    if (!payload.transaction.signature) {
      return Response.json(
        { error: "Invalid transaction signature" },
        { status: 400 }
      );
    }

    // Get the payment record by transaction ID
    const paymentRecord = await getPaymentRecordByTransactionId(
      payload.transaction.signature
    );

    if (!paymentRecord) {
      Logger.info("No payment record found with actual transaction signature", {
        transactionId: payload.transaction.signature,
      });

      // Return an error indicating the payment record wasn't found
      // In a real implementation, we would have a way to map transactions to users
      return Response.json(
        { error: "Payment record not found for this transaction" },
        { status: 400 }
      );
    }

    // Verify the transaction on the blockchain
    const verificationResult = await paymentVerificationService.verifyPayment(
      payload.transaction.signature,
      paymentRecord.user_id,
      paymentRecord.expected_amount,
      paymentRecord.token,
      paymentRecord.recipient
    );

    if (!verificationResult.success) {
      Logger.error("Transaction verification failed:", {
        error: verificationResult.error,
        signature: payload.transaction.signature,
      });

      // Update the payment record status to failed
      try {
        const { updatePaymentRecordStatus } = await import("@/lib/database");
        const recordUpdated = await updatePaymentRecordStatus(
          payload.transaction.signature,
          "failed"
        );
        if (!recordUpdated) {
          Logger.warn("Failed to update payment record status to failed", {
            userId: paymentRecord.user_id,
            transactionId: payload.transaction.signature,
          });
        }
      } catch (error) {
        Logger.error("Error updating payment record status to failed:", {
          error: error instanceof Error ? error.message : String(error),
          userId: paymentRecord.user_id,
          transactionId: payload.transaction.signature,
        });
      }

      return Response.json(
        { error: "Transaction verification failed" },
        { status: 400 }
      );
    }

    // If the transaction is confirmed and successful, process the payment
    if (payload.result === "confirmed" || payload.result === "finalized") {
      Logger.info("Payment successfully verified and processed:", {
        userId: paymentRecord.user_id,
        transactionSignature: payload.transaction.signature,
      });

      // Update the payment record status to confirmed
      try {
        const { updatePaymentRecordStatus } = await import("@/lib/database");
        const recordUpdated = await updatePaymentRecordStatus(
          payload.transaction.signature,
          "confirmed"
        );
        if (!recordUpdated) {
          Logger.warn("Failed to update payment record status to confirmed", {
            userId: paymentRecord.user_id,
            transactionId: payload.transaction.signature,
          });
        }
      } catch (error) {
        Logger.error("Error updating payment record status:", {
          error: error instanceof Error ? error.message : String(error),
          userId: paymentRecord.user_id,
          transactionId: payload.transaction.signature,
        });
      }

      // Send notification to user about successful payment
      await sendPaymentConfirmationNotification(
        paymentRecord.user_id,
        payload.transaction.signature,
        (verificationResult.details?.actualAmount ||
          verificationResult.details?.expectedAmount) ??
          0
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    const errorObj =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };
    Logger.error("Error processing Solana webhook:", errorObj);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper function to get payment record by transaction ID
// This function queries the database to find the payment record associated with this transaction ID
async function getPaymentRecordByTransactionId(
  transactionId: string
): Promise<PaymentRecord | null> {
  try {
    // Use the database function to get the payment record
    const { getPaymentRecordByTransactionId: getPaymentRecord } = await import(
      "@/lib/database"
    );
    const paymentRecord = await getPaymentRecord(transactionId);

    if (!paymentRecord) {
      Logger.info("No payment record found for transaction ID:", {
        transactionId,
      });
      return null;
    }

    return paymentRecord;
  } catch (error) {
    const errorObj =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };
    Logger.error("Error in getPaymentRecordByTransactionId:", errorObj);
    return null;
  }
}

// Helper function to send payment confirmation notification
async function sendPaymentConfirmationNotification(
  userId: string,
  transactionId: string,
  creditsAdded: number
) {
  // In a real implementation, this would send a notification to the user
  // via email, push notification, or WebSocket
  try {
    Logger.info("Payment confirmation notification sent:", {
      userId,
      transactionId,
      creditsAdded,
    });
  } catch (error) {
    const errorObj =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };
    Logger.error("Error sending payment confirmation notification:", errorObj);
  }
}

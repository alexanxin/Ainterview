/**
 * Payment Compatibility Layer
 * Maintains backward compatibility while providing enhanced security
 */

import {
  getPaymentRecordByTransactionId,
  createPaymentRecord as dbCreatePaymentRecord,
  updatePaymentRecordStatus as dbUpdatePaymentRecordStatus,
  getPendingPaymentRecordsByUser as dbGetPendingPaymentRecordsByUser,
  updatePaymentRecordTransactionId as dbUpdatePaymentRecordTransactionId,
} from "@/lib/database";

// Helper functions that provide compatibility between old and new payment systems

export async function createPaymentRecord(paymentData: {
  user_id: string;
  transaction_id: string;
  expected_amount: number;
  token: string;
  recipient: string;
}) {
  try {
    // Use direct database function instead of API calls
    const result = await dbCreatePaymentRecord({
      user_id: paymentData.user_id,
      transaction_id: paymentData.transaction_id,
      expected_amount: paymentData.expected_amount,
      token: paymentData.token as "USDC" | "USDT" | "CASH",
      recipient: paymentData.recipient,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating payment record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPaymentRecordByTransactionIdCompat(
  transactionId: string
) {
  try {
    const record = await getPaymentRecordByTransactionId(transactionId);
    return record;
  } catch (error) {
    console.error("Error getting payment record:", error);
    return null;
  }
}

export async function updatePaymentRecordStatusCompat(
  transactionId: string,
  status: "pending" | "confirmed" | "failed"
) {
  try {
    const result = await dbUpdatePaymentRecordStatus(transactionId, status);
    return result;
  } catch (error) {
    console.error("Error updating payment record status:", error);
    return false;
  }
}

export async function getPendingPaymentRecordsByUserCompat(
  userId: string,
  minutesBack: number = 10
) {
  try {
    const records = await dbGetPendingPaymentRecordsByUser(userId, minutesBack);
    return records;
  } catch (error) {
    console.error("Error getting pending payment records:", error);
    return [];
  }
}

export async function updatePaymentRecordTransactionIdCompat(
  tempTransactionId: string,
  actualTransactionId: string
) {
  try {
    const result = await dbUpdatePaymentRecordTransactionId(
      tempTransactionId,
      actualTransactionId
    );
    return result;
  } catch (error) {
    console.error("Error updating payment record transaction ID:", error);
    return false;
  }
}

/**
 * Enhanced payment verification with security but backward compatibility
 */
export async function verifyPaymentWithSecurity({
  transactionId,
  expectedAmount,
  expectedToken,
  userId,
  x402Service,
}: {
  transactionId: string;
  expectedAmount: number;
  expectedToken: string;
  userId: string;
  x402Service: {
    verifySolanaPayment: (
      transactionId: string,
      userId: string,
      expectedAmount?: number,
      expectedToken?: "USDC" | "USDT" | "CASH"
    ) => Promise<{
      success: boolean;
      creditsAdded?: number;
      error?: string;
    }>;
  };
}) {
  try {
    // Step 1: Check if transaction already processed (basic replay prevention)
    const existingRecord = await getPaymentRecordByTransactionIdCompat(
      transactionId
    );
    if (existingRecord && existingRecord.verified_at) {
      return {
        success: false,
        error: "Transaction has already been processed",
        alreadyProcessed: true,
      };
    }

    // Step 2: Verify the payment using the server-side service
    const result = await x402Service.verifySolanaPayment(
      transactionId,
      userId,
      expectedAmount,
      expectedToken as "USDC" | "USDT" | "CASH"
    );

    // Step 3: If verification successful, process payment normally but with enhanced security
    if (result.success && result.creditsAdded && result.creditsAdded > 0) {
      // Create or update payment record if needed
      if (!existingRecord) {
        const recordResult = await createPaymentRecord({
          user_id: userId,
          transaction_id: transactionId,
          expected_amount: expectedAmount,
          token: expectedToken,
          recipient:
            process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
        });

        if (!recordResult.success) {
          console.warn(
            "Failed to create payment record, but continuing verification"
          );
        }
      }

      // Update status to confirmed
      await updatePaymentRecordStatusCompat(transactionId, "confirmed");

      return {
        success: true,
        creditsAdded: result.creditsAdded,
        transactionId,
      };
    } else {
      // Payment verification failed
      if (existingRecord) {
        await updatePaymentRecordStatusCompat(transactionId, "failed");
      }

      return {
        success: false,
        error: result.error || "Payment verification failed",
      };
    }
  } catch (error) {
    console.error("Error in payment verification with security:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown verification error",
    };
  }
}

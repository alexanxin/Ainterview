// Simple X402 Client Utilities for Ainterview
// This file contains client-side logic for handling the X402 payment flow

import { Logger } from "@/lib/logger";

interface X402PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string; // In atomic units
  payTo: string; // Wallet address
  asset: string; // Token mint address
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  extra: {
    memo?: string;
    usdAmount?: number;
  };
}

interface X402PaymentResponse {
  x402Version: number;
  accepts: X402PaymentRequirements[];
}

interface PaymentPayload {
  serializedTransaction: string;
}

interface X402PaymentHeader {
  x402Version: number;
  scheme: string;
  network: string;
  payload: PaymentPayload;
}

/**
 * Checks if a response is an X402 payment required response
 */
export function isX402PaymentRequired(response: Response): boolean {
  return response.status === 402;
}

/**
 * Parses X402 payment requirements from response
 */
export async function parseX402PaymentRequirements(
  response: Response
): Promise<X402PaymentResponse | null> {
  if (!isX402PaymentRequired(response)) {
    return null;
  }

  try {
    const data = await response.json();
    return data as X402PaymentResponse;
  } catch (error) {
    Logger.error("Error parsing X402 payment requirements:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Creates a payment header for X402 flow
 */
export function createX402PaymentHeader(serializedTransaction: string): string {
  const paymentHeader: X402PaymentHeader = {
    x402Version: 1,
    scheme: "exact",
    network: "solana", // This would be dynamic in a real implementation
    payload: {
      serializedTransaction,
    },
  };

  // Base64 encode the JSON payload
  const jsonString = JSON.stringify(paymentHeader);
  return btoa(jsonString);
}

/**
 * Processes a successful payment response from the server
 */
export async function processX402PaymentResponse(response: Response): Promise<{
  success: boolean;
  txHash?: string;
  networkId?: string;
  explorerUrl?: string;
} | null> {
  const paymentResponseHeader = response.headers.get("X-PAYMENT-RESPONSE");

  if (!paymentResponseHeader) {
    return null;
  }

  try {
    // Decode the base64 payment response header
    const decoded = atob(paymentResponseHeader);
    const paymentResponse = JSON.parse(decoded);

    return {
      success: paymentResponse.success,
      txHash: paymentResponse.txHash,
      networkId: paymentResponse.networkId,
      explorerUrl: paymentResponse.explorerUrl,
    };
  } catch (error) {
    Logger.error("Error processing X402 payment response:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Handles the X402 payment flow for a given request
 * This function integrates with a wallet adapter
 */
export async function handleX402PaymentFlow(
  originalRequest: () => Promise<Response>,
  paymentRequirements: X402PaymentRequirements,
  connection: unknown, // Solana connection instance
  wallet: unknown, // Wallet adapter instance
  onPaymentInitiated?: (message: string) => void,
  onPaymentSuccess?: (message: string) => void,
  onPaymentFailure?: (message: string) => void
): Promise<Response> {
  Logger.info("Starting X402 payment flow", { paymentRequirements });

  try {
    // Show notification about payment initiation
    if (onPaymentInitiated) {
      onPaymentInitiated(
        `Payment required: Please complete the transaction in your wallet to continue. Amount: ${
          Number(paymentRequirements.maxAmountRequired) / 10000
        } USDC.`
      );
    } else {
      // Fallback to console log if no notification function provided
      console.log(
        `Payment required: Please complete the transaction in your wallet to continue. Amount: ${
          Number(paymentRequirements.maxAmountRequired) / 1000000
        } USDC.`
      );
    }

    // For now, assume user wants to proceed with payment
    const userConfirmed = true;

    if (!userConfirmed) {
      throw new Error("User declined payment");
    }

    // In a real implementation, you would:
    // 1. Connect to the user's wallet
    // 2. Build a Solana transaction with the payment details
    // 3. Have the user sign the transaction
    // 4. Serialize the transaction to base64

    // For this example, we'll simulate the transaction creation
    // In reality, this would be the serialized and signed transaction
    const serializedTransaction = await simulateTransactionCreation(
      connection as any,
      wallet as any,
      paymentRequirements
    );

    // Create the X-PAYMENT header with the serialized transaction
    const paymentHeader = createX402PaymentHeader(serializedTransaction);

    // Create new request with payment header by reconstructing the original request
    const originalArgs = (originalRequest as any).originalArgs || {};

    const response = await fetch(originalArgs.url || "/api/gemini", {
      method: originalArgs.method || "POST",
      headers: {
        ...originalArgs.headers,
        "X-PAYMENT": paymentHeader,
        "Content-Type": "application/json",
      },
      body: originalArgs.body || JSON.stringify(originalArgs.payload || {}),
    });

    // Process the payment response
    const paymentResult = await processX402PaymentResponse(response);
    if (paymentResult && paymentResult.success) {
      // Show success notification
      if (onPaymentSuccess) {
        onPaymentSuccess(
          `Payment successful! Credits have been added to your account.`
        );
      } else {
        console.log(
          `Payment successful! Credits have been added to your account.`
        );
      }
    } else if (paymentResult && !paymentResult.success) {
      // Show failure notification
      if (onPaymentFailure) {
        onPaymentFailure(
          "Payment verification failed. Please contact support if you were charged."
        );
      } else {
        console.log(
          "Payment verification failed. Please contact support if you were charged."
        );
      }
    }

    return response;
  } catch (error) {
    Logger.error("Error in X402 payment flow:", {
      error: error instanceof Error ? error.message : String(error),
    });

    // Return an error response
    return new Response(
      JSON.stringify({
        error: "Payment failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 402 }
    );
  }
}

/**
 * Simulates transaction creation (in a real implementation, this would interact with Solana)
 */
async function simulateTransactionCreation(
  connection: any,
  wallet: any,
  paymentRequirements: X402PaymentRequirements
): Promise<string> {
  // This is a simulation - in a real implementation, you would:
  // 1. Create a Solana transaction with the payment details
  // 2. Have the user's wallet sign it
  // 3. Return the serialized transaction

  // For simulation purposes, return a mock serialized transaction
  return "mock_serialized_transaction_" + Date.now();
}

/**
 * Wrapper function to make requests with automatic X402 handling
 */
export async function makeRequestWithX402Handling(
  url: string,
  options: RequestInit,
  connection: unknown, // Solana connection instance
  wallet: unknown, // Wallet adapter instance
  onPaymentInitiated?: (message: string) => void,
  onPaymentSuccess?: (message: string) => void,
  onPaymentFailure?: (message: string) => void
): Promise<Response> {
  // First, make the request without payment
  let response = await fetch(url, options);

  // If we get a 402 response, handle the payment flow
  if (isX402PaymentRequired(response)) {
    const paymentRequirements = await parseX402PaymentRequirements(response);

    if (paymentRequirements && paymentRequirements.accepts.length > 0) {
      // Handle the payment flow with the original request details
      response = await handleX402PaymentFlow(
        () => fetch(url, options),
        paymentRequirements.accepts[0],
        connection,
        wallet,
        onPaymentInitiated,
        onPaymentSuccess,
        onPaymentFailure
      );
    }
  }

  return response;
}

/**
 * Alternative wrapper that works with fetch-like functions
 */
export async function executeWithX402Handling(
  requestExecutor: (paymentHeader?: string) => Promise<Response>,
  connection: unknown, // Solana connection instance
  wallet: unknown, // Wallet adapter instance
  onPaymentRequired?: (paymentReq: X402PaymentRequirements) => void,
  onPaymentSuccess?: (result: {
    txHash?: string;
    explorerUrl?: string;
  }) => void,
  onPaymentInitiated?: (message: string) => void,
  onPaymentFailure?: (message: string) => void
): Promise<Response> {
  // First, make the request without payment
  let response = await requestExecutor();

  // If we get a 402 response, handle the payment flow
  if (isX402PaymentRequired(response)) {
    const paymentRequirements = await parseX402PaymentRequirements(response);

    if (paymentRequirements && paymentRequirements.accepts.length > 0) {
      // Notify callback if provided
      if (onPaymentRequired) {
        onPaymentRequired(paymentRequirements.accepts[0]);
      }

      try {
        // The onPaymentRequired callback is responsible for showing the initial notification.
        // We will remove the redundant onPaymentInitiated call here.

        // For now, assume user wants to proceed with payment
        const userConfirmed = true;

        if (!userConfirmed) {
          throw new Error("User declined payment");
        }

        // Simulate transaction creation
        const serializedTransaction = await simulateTransactionCreation(
          connection as any,
          wallet as any,
          paymentRequirements.accepts[0]
        );

        // Create the X-PAYMENT header with the serialized transaction
        const paymentHeader = createX402PaymentHeader(serializedTransaction);

        // Retry the request with the payment header
        response = await requestExecutor(paymentHeader);

        // Process the payment response
        const paymentResult = await processX402PaymentResponse(response);
        if (paymentResult && paymentResult.success && onPaymentSuccess) {
          onPaymentSuccess(paymentResult);

          // Additionally, show a user-friendly success message using the onPaymentInitiated callback
          // Since we don't have a dedicated success notification function, we'll use onPaymentInitiated for the success message
          // Actually, we should have a separate success notification function, so let's add one
          // For now, we'll use console.log to show the success message
          console.log(
            `Payment successful! 4 credits have been added to your account (5 purchased, 1 consumed for this request).`
          );
        } else if (paymentResult && !paymentResult.success) {
          // Show failure notification
          if (onPaymentFailure) {
            onPaymentFailure(
              "Payment verification failed. Please contact support if you were charged."
            );
          } else {
            console.log(
              "Payment verification failed. Please contact support if you were charged."
            );
          }
        }
      } catch (error) {
        Logger.error("Error in X402 payment flow:", {
          error: error instanceof Error ? error.message : String(error),
        });

        // Return an error response
        return new Response(
          JSON.stringify({
            error: "Payment failed",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          }),
          { status: 402 }
        );
      }
    }
  }

  return response;
}

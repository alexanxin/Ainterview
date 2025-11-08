// X402 Client Utilities for Ainterview
// This file contains client-side logic for handling the X402 payment flow

import { Logger } from "@/lib/logger";

export interface X402PaymentRequirements {
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
 * This would contain the serialized transaction in a real implementation
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
 * This function would integrate with a wallet adapter in a real implementation
 */
export async function handleX402PaymentFlow(
  originalRequest: () => Promise<Response>,
  paymentRequirements: X402PaymentRequirements
): Promise<Response> {
  Logger.info("Starting X402 payment flow", { paymentRequirements });

  // In a real implementation, this is where you would:
  // 1. Prompt the user with payment details
  // 2. Connect to their Solana wallet
  // 3. Build and sign a transaction
  // 4. Retry the original request with the payment header

  // For now, we'll simulate the process with mock data
  const mockSerializedTransaction = "mock_serialized_transaction_data";
  const paymentHeader = createX402PaymentHeader(mockSerializedTransaction);

  // Retry the original request with the payment header
  // This is a simplified version - in reality, you'd need to reconstruct the request
  const requestConfig = {
    headers: {
      "X-PAYMENT": paymentHeader,
      "Content-Type": "application/json",
    },
  };

  // For this example, we'll just return a mock successful response
  // In a real implementation, you would make the actual request with the payment header
  const mockResponse = new Response(
    JSON.stringify({
      success: true,
      message: "Payment processed successfully",
      paymentRequirements,
    }),
    {
      status: 200,
      headers: {
        "X-PAYMENT-RESPONSE": btoa(
          JSON.stringify({
            success: true,
            txHash: "mock_tx_hash_123",
            networkId: "solana",
            explorerUrl: "https://explorer.solana.com/tx/mock_tx_hash_123",
          })
        ),
      },
    }
  );

  return mockResponse;
}

/**
 * Wrapper function to make requests with automatic X402 handling
 */
export async function makeRequestWithX402Handling(
  requestFn: () => Promise<Response>
): Promise<Response> {
  // First, make the request without payment
  let response = await requestFn();

  // If we get a 402 response, handle the payment flow
  if (isX402PaymentRequired(response)) {
    const paymentRequirements = await parseX402PaymentRequirements(response);

    if (paymentRequirements && paymentRequirements.accepts.length > 0) {
      // Handle the payment flow
      response = await handleX402PaymentFlow(
        requestFn,
        paymentRequirements.accepts[0]
      );
    }
  }

  return response;
}

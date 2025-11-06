// Enhanced X402 Client Utilities for Ainterview
// This file contains client-side logic for handling the X402 payment flow with Solana wallet integration

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
export async function processX402PaymentResponse(
  response: Response
): Promise<{
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
 * Builds a Solana transaction for the X402 payment
 * This requires the @solana/web3.js and @solana/spl-token libraries
 */
export async function buildSolanaPaymentTransaction(
  connection: any, // Connection from @solana/web3.js
  senderPublicKey: any, // PublicKey from @solana/web3.js
  paymentRequirements: X402PaymentRequirements,
  wallet: any // Wallet adapter instance
): Promise<string> {
  try {
    // Dynamically import Solana libraries
    const solanaModules = await Promise.all([
      import("@solana/web3.js"),
      import("@solana/spl-token"),
    ]);

    const { Transaction, SystemProgram, PublicKey } = solanaModules[0];
    const {
      createTransferInstruction,
      getAssociatedTokenAddress,
      TOKEN_PROGRAM_ID,
      createAssociatedTokenAccountInstruction,
    } = solanaModules[1];

    // Convert the recipient address to PublicKey
    const recipientPublicKey = new PublicKey(paymentRequirements.payTo);

    // Convert the token mint address to PublicKey
    const tokenMintPublicKey = new PublicKey(paymentRequirements.asset);

    // Get the associated token accounts for sender and recipient
    const senderTokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      senderPublicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      recipientPublicKey
    );

    // Create a new transaction
    const transaction = new Transaction();

    // Check if the recipient's associated token account exists
    const recipientTokenAccountInfo = await connection.getAccountInfo(
      recipientTokenAccount
    );
    if (!recipientTokenAccountInfo) {
      // If it doesn't exist, create it
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPublicKey, // payer
          recipientTokenAccount, // ata
          recipientPublicKey, // owner
          tokenMintPublicKey // mint
        )
      );
    }

    // Add the transfer instruction to the transaction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount, // source
        recipientTokenAccount, // destination
        senderPublicKey, // owner
        BigInt(paymentRequirements.maxAmountRequired) // amount in atomic units
      )
    );

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;

    // Sign the transaction using the wallet
    const signedTransaction = await wallet.signTransaction(transaction);

    // Serialize the transaction to wire format
    const serializedTransaction = signedTransaction.serialize();

    // Convert to base64 string for the header
    return Buffer.from(serializedTransaction).toString("base64");
  } catch (error) {
    Logger.error("Error building Solana payment transaction:", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Handles the X402 payment flow for a given request
 * This function integrates with a wallet adapter
 */
export async function handleX402PaymentFlow(
  originalRequest: () => Promise<Response>,
  paymentRequirements: X402PaymentRequirements,
  connection: any, // Solana connection instance
  wallet: any // Wallet adapter instance
): Promise<Response> {
  Logger.info("Starting X402 payment flow", { paymentRequirements });

  try {
    // Prompt the user about the payment
    const amountInUsdc = Number(paymentRequirements.maxAmountRequired) / 10000; // Convert from atomic units to USDC
    const userConfirmed = confirm(
      `Out of credits—pay ${amountInUsdc} USDC for 5 more?`
    );

    if (!userConfirmed) {
      throw new Error("User declined payment");
    }

    // Check if wallet is connected
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Build the payment transaction
    const serializedTransaction = await buildSolanaPaymentTransaction(
      connection,
      wallet.publicKey,
      paymentRequirements,
      wallet
    );

    // Create the X-PAYMENT header with the serialized transaction
    const paymentHeader = createX402PaymentHeader(serializedTransaction);

    // Create new request with payment header by reconstructing the original request
    // This is a simplified approach - in a real implementation, you'd need to capture
    // the original request details to reconstruct it properly
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
 * Wrapper function to make requests with automatic X402 handling
 * Accepts a request config object instead of a function to allow proper reconstruction
 */
export async function makeRequestWithX402Handling(
  url: string,
  options: RequestInit,
  connection: any, // Solana connection instance
  wallet: any // Wallet adapter instance
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
        wallet
      );
    }
  }

  return response;
}

/**
 * Alternative wrapper that works with fetch-like functions
 */
export async function executeWithX402Handling<T>(
  requestExecutor: (paymentHeader?: string) => Promise<Response>,
  connection: any, // Solana connection instance
  wallet: any, // Wallet adapter instance
  onPaymentRequired?: (paymentReq: X402PaymentRequirements) => void,
  onPaymentSuccess?: (result: { txHash?: string; explorerUrl?: string }) => void
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
        // Prompt the user about the payment
        const amountInUsdc =
          Number(paymentRequirements.accepts[0].maxAmountRequired) / 100000; // Convert from atomic units to USDC
        const userConfirmed = confirm(
          `Out of credits—pay ${amountInUsdc} USDC for 5 more?`
        );

        if (!userConfirmed) {
          throw new Error("User declined payment");
        }

        // Check if wallet is connected
        if (!wallet.publicKey) {
          throw new Error("Wallet not connected");
        }

        // Build the payment transaction
        const serializedTransaction = await buildSolanaPaymentTransaction(
          connection,
          wallet.publicKey,
          paymentRequirements.accepts[0],
          wallet
        );

        // Create the X-PAYMENT header with the serialized transaction
        const paymentHeader = createX402PaymentHeader(serializedTransaction);

        // Retry the request with the payment header
        response = await requestExecutor(paymentHeader);

        // Process the payment response
        const paymentResult = await processX402PaymentResponse(response);
        if (paymentResult && paymentResult.success && onPaymentSuccess) {
          onPaymentSuccess(paymentResult);
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

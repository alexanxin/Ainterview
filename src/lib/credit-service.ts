import { supabase } from "./supabase";

// Define the X402PaymentRequirements interface locally to avoid import issues
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

interface CreditCheckRequest {
  action: "start_interview" | "reanswer_question";
  context?: {
    sessionId?: string;
    questionId?: string;
    operation: string;
    numberOfQuestions?: number; // Added for dynamic pricing based on question count
  };
}

interface CreditCheckResponse {
  sufficientCredits: boolean;
  requiredCredits: number;
  currentCredits: number;
  operation: string;
  redirectToPayment?: boolean;
  paymentUrl?: string;

  // X402 compliance fields
  x402Version: number;
  accepts: X402PaymentRequirements[];
  status: 200 | 402;
  message: string;
}

// Helper function to get credit requirements
export const getCreditRequirements = (
  action: string,
  numberOfQuestions?: number
): number => {
  switch (action) {
    case "start_interview":
      // For start_interview, use the number of questions selected (5-10)
      // If no number of questions is provided, default to 5
      return numberOfQuestions !== undefined ? numberOfQuestions : 5;
    case "reanswer_question":
      return 1;
    default:
      return 5; // Default to 5 credits for any other operation
  }
};

// Helper function to generate payment requirements for X402
export const generatePaymentRequirements = (
  requiredCredits: number,
  action: string
): X402PaymentRequirements => {
  // Calculate USDC amount based on credits (assuming $0.10 per credit)
  const usdAmount = requiredCredits * 0.1;

  // Convert to micro-USDC (assuming 6 decimal places for USDC)
  const amountInMicroUSDC = Math.round(usdAmount * 1000000).toString();

  // Determine description based on action
  let description = "";
  switch (action) {
    case "start_interview":
      description = `${requiredCredits} credits for interview session`;
      break;
    case "reanswer_question":
      description = `${requiredCredits} credit for re-answering question`;
      break;
    default:
      description = `${requiredCredits} credits for ${action}`;
  }

  return {
    scheme: "exact",
    network: "solana",
    maxAmountRequired: amountInMicroUSDC,
    payTo: process.env.SOLANA_WALLET_ADDRESS || "YourWalletAddress",
    asset: process.env.USDC_MINT_ADDRESS || "USDC mint address",
    description,
    mimeType: "application/json",
    maxTimeoutSeconds: 300,
    extra: {
      memo: `${requiredCredits} credits purchase`,
      usdAmount,
    },
  };
};

/**
 * Client-side function to check credits before performing an operation
 * This calls the centralized API endpoint
 */
export const checkCreditsBeforeOperation = async (
  action: "start_interview" | "reanswer_question",
  context?: {
    sessionId?: string;
    questionId?: string;
    operation: string;
    numberOfQuestions?: number;
  }
): Promise<CreditCheckResponse> => {
  try {
    // Get the current user from Supabase auth
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;
    if (!userId) {
      throw new Error("User ID not found in session");
    }

    const requestBody: CreditCheckRequest = {
      action,
      context,
    };

    const response = await fetch("/api/credits/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        "x-user-id": userId,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Handle the response based on status
    if (response.status === 402) {
      // Payment required - return the 402 data to trigger payment modal
      // The calling component should handle showing the payment modal
      return data;
    } else if (response.status === 200) {
      // Sufficient credits - proceed with operation
      return data;
    } else {
      throw new Error(data.message || "Error checking credits");
    }
  } catch (error) {
    console.error("Error checking credits:", error);
    throw error;
  }
};

/**
 * Function to handle credit check and redirect if needed
 * Returns true if operation can proceed, false if redirected to payment
 */
export const handleCreditCheckAndRedirect = async (
  action: "start_interview" | "reanswer_question",
  onProceed?: () => void,
  onRedirect?: () => void,
  returnUrl?: string
): Promise<boolean> => {
  try {
    const result = await checkCreditsBeforeOperation(action);

    if (result.sufficientCredits) {
      // User has enough credits, proceed with operation
      if (onProceed) onProceed();
      return true;
    } else {
      // User needs to purchase credits, they will be redirected by the API
      // Append return URL to the payment URL if provided
      if (returnUrl && result.paymentUrl) {
        const paymentUrlWithReturn = `${
          result.paymentUrl
        }&returnUrl=${encodeURIComponent(returnUrl)}`;
        window.location.href = paymentUrlWithReturn;
      }

      if (onRedirect) onRedirect();
      return false;
    }
  } catch (error) {
    console.error("Error during credit check:", error);
    // In case of error, allow operation to proceed (fail open) but log the issue
    if (onProceed) onProceed();
    return true;
  }
};

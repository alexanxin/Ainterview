import { NextRequest } from "next/server";
import { getUserCredits } from "@/lib/database";
import { supabaseServer } from "@/lib/supabase-server";
import { X402PaymentRequirements } from "@/lib/x402-client";

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
const getCreditRequirements = (
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
const generatePaymentRequirements = (
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

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: CreditCheckRequest = await request.json();
    const { action, context } = body;

    // Get the user ID from the request headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          message: "User authentication is required to check credits",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1]; // Bearer token
    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Invalid authorization header",
          message: "Authorization header must follow 'Bearer {token}' format",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify the token using Supabase server-side client
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid or expired authentication token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;
    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "User ID not found",
          message: "User ID could not be extracted from token",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get required credits based on action and number of questions
    const requiredCredits = getCreditRequirements(
      action,
      context?.numberOfQuestions
    );

    // Get current user credits from database
    const currentCredits = await getUserCredits(userId);

    // Check if user has sufficient credits
    const sufficientCredits = currentCredits >= requiredCredits;

    // Prepare response
    let response: CreditCheckResponse;

    if (sufficientCredits) {
      // User has enough credits
      response = {
        sufficientCredits: true,
        requiredCredits,
        currentCredits,
        operation: action,
        x402Version: 1,
        accepts: [],
        status: 200,
        message: "Sufficient credits available",
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // User needs to purchase credits
      const paymentRequirements = generatePaymentRequirements(
        requiredCredits,
        action
      );

      response = {
        sufficientCredits: false,
        requiredCredits,
        currentCredits,
        operation: action,
        redirectToPayment: true,
        paymentUrl: `/payment?amount=${requiredCredits}&operation=${action}`,
        x402Version: 1,
        accepts: [paymentRequirements],
        status: 402,
        message: "Additional credits required",
      };

      // Return 402 status with X402 compliance headers
      return new Response(JSON.stringify(response), {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "X-Payment-Required": "true",
          "X-Payment-Operation": action,
        },
      });
    }
  } catch (error) {
    console.error("Error in credit check API:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "An error occurred while checking credits",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

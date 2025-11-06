// Enhanced x402 API handler for Ainterview
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-server';
import { x402Service } from '@/lib/x402-payment-service';
import { getUserCredits, deductUserCredits, addUserCredits } from '@/lib/database';
import { Logger } from '@/lib/logger';

// Define payment verification middleware for x402
export async function verifyX402Payment(
  userId: string,
  transactionSignature: string,
  expectedAmount: number,
  expectedToken: 'USDC' | 'USDT' | 'CASH' = 'USDC'
): Promise<{ success: boolean; error?: string; creditsAdded?: number }> {
  try {
    // Verify the payment on the Solana blockchain
    const verificationResult = await x402Service.verifySolanaPayment(
      transactionSignature,
      expectedAmount,
      expectedToken
    );

    if (!verificationResult.success) {
      return {
        success: false,
        error: verificationResult.error || 'Payment verification failed'
      };
    }

    if (verificationResult.creditsAdded) {
      // Add the verified credits to the user's account
      const creditsAdded = await addUserCredits(userId, verificationResult.creditsAdded);
      
      if (!creditsAdded) {
        return {
          success: false,
          error: 'Failed to update user credits after successful payment verification'
        };
      }

      return {
        success: true,
        creditsAdded: verificationResult.creditsAdded
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error in x402 payment verification:', error);
    return {
      success: false,
      error: 'Payment verification failed due to internal error'
    };
  }
}

// Enhanced /api/gemini/route.ts with payment verification
// This would be added to the existing route file

/*
// At the top of the file, add these new functions:

// Function to check if a payment signature is provided and valid
async function verifyPaymentSignature(
  userId: string, 
  req: NextRequest
): Promise<{ valid: boolean; error?: string; transactionId?: string }> {
  // Check for payment signature in request headers
  const paymentSignature = req.headers.get('x-payment-signature') || req.headers.get('x-transaction-signature');
  
  if (!paymentSignature) {
    return { valid: false, error: 'No payment signature provided' };
  }

  // If we have a payment signature, verify it
  try {
    // Extract amount details from context (would need to store payment intent details)
    // In a real implementation, you'd retrieve the expected amount from a payment session
    const expectedAmount = 1; // Placeholder - in real implementation get from stored payment intent
    
    const verificationResult = await verifyX402Payment(userId, paymentSignature, expectedAmount, 'USDC');
    
    if (verificationResult.success) {
      return { 
        valid: true, 
        transactionId: paymentSignature 
      };
    } else {
      return { 
        valid: false, 
        error: verificationResult.error 
      };
    }
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return { 
      valid: false, 
      error: 'Payment verification failed' 
    };
  }
}

// Enhanced checkUsage function that also verifies recent payments
async function checkUsage(
  userId: string,
  action: string,
  req: NextRequest
): Promise<{
  allowed: boolean;
  remaining: number;
  cost: number;
  freeInterviewUsed: boolean;
  creditsAvailable: number;
  paymentRequired?: {
    amount: number;
    currency: string;
    chain: string;
    recipient: string;
    memo?: string;
  };
}> {
  const cost = 1; // Each action costs 1 credit

  if (!userId || userId === "anonymous") {
    // For anonymous users, only allow basic usage with no personalization
    return {
      allowed: true,
      remaining: -1, // Indicate unlimited for anonymous
      cost,
      freeInterviewUsed: false,
      creditsAvailable: -1, // Unlimited for anonymous users
    };
  }

  // First, check if there's a payment signature that needs verification
  const paymentVerification = await verifyPaymentSignature(userId, req);
  
  if (paymentVerification.valid && paymentVerification.transactionId) {
    // Payment was just verified, allow the action
    return {
      allowed: true,
      remaining: -1, // Unlimited for this request since payment was just made
      cost,
      freeInterviewUsed: true,
      creditsAvailable: 0, // Will be updated after payment processing
    };
  }

  // Check if user has completed their free interview
  const interviewsCompleted = await getUserInterviewsCompleted(userId);
  const freeInterviewUsed = interviewsCompleted >= 1;

  // If user hasn't used their free interview yet, allow it
  if (!freeInterviewUsed) {
    return {
      allowed: true,
      remaining: -1, // Indicate unlimited for free interview
      cost,
      freeInterviewUsed: false,
      creditsAvailable: -1,
    };
  }

  // For users who have used their free interview, check credits
  const creditsAvailable = await getUserCredits(userId);
  
  if (creditsAvailable >= cost) {
    // User has sufficient credits
    return {
      allowed: true,
      remaining: creditsAvailable - cost,
      cost,
      freeInterviewUsed: true,
      creditsAvailable,
    };
  } else {
    // User needs to pay - return payment required information
    return {
      allowed: false,
      remaining: 0,
      cost,
      freeInterviewUsed: true,
      creditsAvailable,
      paymentRequired: {
        amount: cost * 0.01, // 0.01 USDC per credit (adjust as needed)
        currency: 'USDC',
        chain: 'solana',
        recipient: process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'YOUR_WALLET_ADDRESS',
        memo: `Payment for AI service usage - user: ${userId}, action: ${action}`
      }
    };
  }
}

// Updated POST function to handle payment verification
export async function POST(req: NextRequest) {
  try {
    const {
      action,
      context,
      question,
      answer,
      numQuestions = 5,
      userId,
      questions,
      answers,
    } = await req.json();

    // Validate required fields
    if (!action) {
      Logger.error("Action is required");
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Validate and sanitize context if provided
    if (context) {
      try {
        validateInterviewContext(context);
      } catch (validationError) {
        Logger.error("Invalid context provided", { validationError, userId });
        return NextResponse.json(
          { error: "Invalid context provided" },
          { status: 400 }
        );
      }
    }

    // Check if user has sufficient credits or if payment is provided
    const usageCheck = await checkUsage(userId || "anonymous", action, req);

    if (!usageCheck.allowed) {
      Logger.warn("User has insufficient credits", { 
        userId, 
        action,
        creditsAvailable: usageCheck.creditsAvailable,
        cost: usageCheck.cost
      });

      // Return HTTP 402 with x402 protocol details
      const response = NextResponse.json(
        {
          error: "Payment Required",
          needsPayment: true,
          creditsAvailable: usageCheck.creditsAvailable,
          cost: usageCheck.cost,
          message: "Insufficient credits. Please purchase more to continue using AI services.",
          paymentRequired: usageCheck.paymentRequired, // Include payment details
          paymentOptions: {
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment`,
            supportedTokens: ["USDC", "USDT", "CASH"],
            blockchain: "solana"
          }
        },
        { 
          status: 402, // Payment Required
          headers: {
            "WWW-Authenticate": `x402 amount="${usageCheck.paymentRequired?.amount}", currency="${usageCheck.paymentRequired?.currency}", chain="${usageCheck.paymentRequired?.chain}", recipient="${usageCheck.paymentRequired?.recipient}"`, // x402 protocol header
            "X-Payment-Required": "true"
          }
        }
      );
      
      return response;
    }

    // The rest of the API logic remains the same...
*/

// Example middleware for payment verification in API routes
export async function withX402PaymentVerification(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Check if this is a retry after payment
    const transactionSignature = req.headers['x-payment-signature'] as string || 
                               req.headers['x-transaction-signature'] as string;
    
    if (transactionSignature) {
      // Verify the transaction signature before processing
      const userId = req.body?.userId || req.query?.userId; // Get userId from request
      
      if (userId) {
        const verificationResult = await verifyX402Payment(
          userId, 
          transactionSignature,
          1, // Default expected amount
          'USDC'
        );
        
        if (!verificationResult.success) {
          return res.status(402).json({
            error: 'Payment verification failed',
            details: verificationResult.error
          });
        }
      }
    }
    
    // Proceed with original handler
    return handler(req, res);
  };
}
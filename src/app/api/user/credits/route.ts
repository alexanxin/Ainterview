import { NextRequest } from "next/server";
import { addUserCreditsFromPayment, getUserCredits } from "@/lib/database";
import { Logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, transactionId } = await req.json();

    // Validate required fields
    if (!userId || !amount || !transactionId) {
      return Response.json(
        {
          error:
            "Missing required fields: userId, amount, and transactionId are required",
        },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return Response.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Add credits to user account based on payment
    const success = await addUserCreditsFromPayment(userId, amount);

    if (success) {
      // Get updated credit balance
      const updatedCredits = await getUserCredits(userId);

      Logger.info("Successfully added credits from payment", {
        userId,
        amount,
        transactionId,
        newBalance: updatedCredits,
      });

      return Response.json({
        success: true,
        message: `${amount} credits successfully added to account`,
        newBalance: updatedCredits,
      });
    } else {
      Logger.error("Failed to add credits from payment", {
        userId,
        amount,
        transactionId,
      });

      return Response.json(
        { error: "Failed to add credits. Please contact support." },
        { status: 500 }
      );
    }
  } catch (error) {
    Logger.error("Error processing credit addition:", {
      error: error instanceof Error ? error.message : String(error),
      url: req.url,
    });

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Extract userId from query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get current credit balance
    const credits = await getUserCredits(userId);

    return Response.json({
      success: true,
      userId,
      credits,
    });
  } catch (error) {
    Logger.error("Error fetching user credits:", {
      error: error instanceof Error ? error.message : String(error),
      url: req.url,
    });

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

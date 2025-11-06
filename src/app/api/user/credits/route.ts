import { NextRequest, NextResponse } from "next/server";
import { getUserCredits } from "@/lib/database";
import { Logger } from "@/lib/logger";
import { supabaseServer } from "@/lib/supabase-server";
import { SupabaseClient } from "@supabase/supabase-js";

// GET /api/user/credits - Fetches the current user's credit balance
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    Logger.info("Authorization header:", { authHeader });

    if (!authHeader) {
      Logger.info("No authorization header provided");
      return NextResponse.json({ credits: 0 }, { status: 200 });
    }

    const token = authHeader?.split(" ")?.[1]; // Get the JWT part
    Logger.info("Token extracted:", { hasToken: !!token });

    let userId: string | undefined;
    const supabase = supabaseServer as SupabaseClient;

    if (token) {
      // Use the server client to verify the JWT and get the user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      Logger.info("User verification result:", { user: !!user, error });
      userId = user?.id;
    }

    if (!userId) {
      Logger.info("No user ID found, returning 0 credits");
      // Fallback for unauthenticated users
      return NextResponse.json({ credits: 0 }, { status: 200 });
    }

    Logger.info("Fetching credits for user:", { userId });
    const credits = await getUserCredits(userId);
    Logger.info("Credits retrieved:", { credits, userId });

    return NextResponse.json({ credits }, { status: 200 });
  } catch (error) {
    Logger.error("Error fetching user credits:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch user credits" },
      { status: 500 }
    );
  }
}

// POST /api/user/credits - Used to add credits after a successful payment
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    Logger.info("POST /api/user/credits - Authorization header:", {
      authHeader,
    });

    if (!authHeader) {
      Logger.info("POST /api/user/credits - No authorization header provided");
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader?.split(" ")?.[1]; // Get the JWT part
    Logger.info("POST /api/user/credits - Token extracted:", {
      hasToken: !!token,
    });

    let userId: string | undefined;
    const supabase = supabaseServer as SupabaseClient;

    if (token) {
      // Use the server client to verify the JWT and get the user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      Logger.info("POST /api/user/credits - User verification result:", {
        user: !!user,
        error,
      });
      userId = user?.id;
    }

    if (!userId) {
      Logger.info("POST /api/user/credits - No user ID found");
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const { amount, transactionId } = await req.json();
    Logger.info("POST /api/user/credits - Request body:", {
      userId,
      amount,
      transactionId,
    });

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount is required and must be greater than 0" },
        { status: 400 }
      );
    }

    // Add credits to the user's account
    const { addUserCredits } = await import("@/lib/database");
    const success = await addUserCredits(userId, amount);

    if (success) {
      // Fetch updated credit balance
      const updatedCredits = await getUserCredits(userId);
      Logger.info("POST /api/user/credits - Credits added successfully:", {
        userId,
        amount,
        newBalance: updatedCredits,
      });

      // Record the usage in the tracking table
      const { recordUsage } = await import("@/lib/database");
      await recordUsage({
        user_id: userId,
        action: "add_credits",
        cost: -amount, // Negative cost indicates credits added
        free_interview_used: false,
      });

      return NextResponse.json(
        {
          success: true,
          credits: updatedCredits,
          message: `${amount} credits added successfully`,
        },
        { status: 200 }
      );
    } else {
      Logger.error("POST /api/user/credits - Failed to add credits:", {
        userId,
        amount,
      });
      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 }
      );
    }
  } catch (error) {
    Logger.error("POST /api/user/credits - Error adding user credits:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to add user credits" },
      { status: 500 }
    );
  }
}

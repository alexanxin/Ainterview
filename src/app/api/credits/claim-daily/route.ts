import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { Logger } from "@/lib/logger";
import { addUserCredits } from "@/lib/database";
import { cacheService } from "@/lib/cache-service";

interface DailyCreditClaim {
  id?: string;
  user_id: string;
  claim_date: string; // YYYY-MM-DD format
  credits_claimed: number;
  created_at?: string;
}

export async function POST(req: NextRequest) {
  try {
    Logger.info("Daily credit claim request received");

    // Get user from session
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      Logger.warn("No authorization header provided");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(token);

    if (authError || !user) {
      Logger.warn("Invalid authentication token", { error: authError });
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const userId = user.id;
    // Calculate today's date in user's timezone (UTC+1 for Europe/Skopje)
    const now = new Date();
    const userOffsetHours = 1; // UTC+1
    const userTime = new Date(now.getTime() + userOffsetHours * 60 * 60 * 1000);
    const today = userTime.toISOString().split("T")[0]; // YYYY-MM-DD format in user's timezone

    Logger.info("Processing daily credit claim", { userId, today });

    // Check if user has already claimed credits today
    const { data: existingClaim, error: checkError } = await supabaseServer
      .from("daily_credit_claims")
      .select("*")
      .eq("user_id", userId)
      .eq("claim_date", today)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      Logger.error("Error checking existing claims", { error: checkError });
      return NextResponse.json(
        { error: "Failed to verify claim status" },
        { status: 500 }
      );
    }

    if (existingClaim) {
      Logger.warn("User has already claimed credits today", { userId, today });
      return NextResponse.json(
        {
          error: "Credits already claimed today",
          message: "You can only claim your daily free credits once per day.",
        },
        { status: 429 }
      );
    }

    // Check rate limiting - ensure user hasn't made too many requests recently
    const recentClaims = await supabaseServer
      .from("daily_credit_claims")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order("created_at", { ascending: false });

    if (recentClaims.error) {
      Logger.error("Error checking recent claims", {
        error: recentClaims.error,
      });
      return NextResponse.json(
        { error: "Failed to verify claim history" },
        { status: 500 }
      );
    }

    // Prevent abuse - max 1 claim per hour
    if (recentClaims.data && recentClaims.data.length > 0) {
      Logger.warn("User attempting to claim credits too frequently", {
        userId,
        recentClaimsCount: recentClaims.data.length,
      });
      return NextResponse.json(
        {
          error: "Too many claims",
          message: "Please wait before claiming credits again.",
        },
        { status: 429 }
      );
    }

    // Record the claim in database
    const claimData: Omit<DailyCreditClaim, "id" | "created_at"> = {
      user_id: userId,
      claim_date: today,
      credits_claimed: 2,
    };

    const { data: claimRecord, error: insertError } = await supabaseServer
      .from("daily_credit_claims")
      .insert([claimData])
      .select()
      .single();

    if (insertError) {
      Logger.error("Error recording credit claim", { error: insertError });
      return NextResponse.json(
        { error: "Failed to record claim" },
        { status: 500 }
      );
    }

    // Add credits to user account
    const creditsAdded = await addUserCredits(userId, 2);

    if (!creditsAdded) {
      Logger.error("Failed to add credits to user account", { userId });

      // Rollback the claim record
      await supabaseServer
        .from("daily_credit_claims")
        .delete()
        .eq("id", claimRecord.id);

      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 }
      );
    }

    // Invalidate credit cache
    cacheService.invalidateUserCredits(userId);

    Logger.info("Daily credits successfully claimed", {
      userId,
      creditsClaimed: 2,
      claimId: claimRecord.id,
    });

    return NextResponse.json({
      success: true,
      message: "Daily credits claimed successfully!",
      creditsClaimed: 2,
      nextClaimDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
  } catch (error) {
    Logger.error("Error in daily credit claim endpoint", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    Logger.info("Daily credit status check received");

    // Get user from session
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      Logger.warn("No authorization header provided");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(token);

    if (authError || !user) {
      Logger.warn("Invalid authentication token", { error: authError });
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const userId = user.id;
    // Calculate today's date in user's timezone (UTC+1 for Europe/Skopje)
    const now = new Date();
    const userOffsetHours = 1; // UTC+1
    const userTime = new Date(now.getTime() + userOffsetHours * 60 * 60 * 1000);
    const today = userTime.toISOString().split("T")[0]; // YYYY-MM-DD format in user's timezone

    // Check if user has claimed credits today
    const { data: existingClaim, error: checkError } = await supabaseServer
      .from("daily_credit_claims")
      .select("*")
      .eq("user_id", userId)
      .eq("claim_date", today)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      Logger.error("Error checking claim status", { error: checkError });
      return NextResponse.json(
        { error: "Failed to check claim status" },
        { status: 500 }
      );
    }

    const hasClaimedToday = !!existingClaim;

    // Get today's usage count (using user's timezone)
    // Calculate start and end of day in user's timezone
    const userOffsetMs = userOffsetHours * 60 * 60 * 1000;
    const startOfDay = new Date(userTime);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setTime(startOfDay.getTime() - userOffsetMs); // Convert to UTC

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);
    endOfDay.setTime(
      endOfDay.getTime() - userOffsetMs + 24 * 60 * 60 * 1000 - 1
    ); // End of day in UTC

    const { data: usageData, error: usageError } = await supabaseServer
      .from("usage_tracking")
      .select("cost")
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString())
      .lt("created_at", endOfDay.toISOString())
      .gt("cost", 0);

    if (usageError) {
      Logger.error("Error checking today's usage", { error: usageError });
      return NextResponse.json(
        { error: "Failed to check usage" },
        { status: 500 }
      );
    }

    const todayUsageCount =
      usageData?.reduce((sum, record) => sum + record.cost, 0) || 0;

    // Calculate today's purchased credits (negative cost records)
    const { data: purchaseData, error: purchaseError } = await supabaseServer
      .from("usage_tracking")
      .select("cost")
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString())
      .lt("created_at", endOfDay.toISOString())
      .lt("cost", 0);

    if (purchaseError) {
      Logger.error("Error checking today's purchases", {
        error: purchaseError,
      });
      return NextResponse.json(
        { error: "Failed to check purchases" },
        { status: 500 }
      );
    }

    const todayPurchased = Math.abs(
      purchaseData?.reduce((sum, record) => sum + record.cost, 0) || 0
    );

    // Calculate today's claimed free credits (from daily_credit_claims table)
    const { data: claimedData, error: claimedError } = await supabaseServer
      .from("daily_credit_claims")
      .select("credits_claimed")
      .eq("user_id", userId)
      .eq("claim_date", today);

    if (claimedError && claimedError.code !== "PGRST116") {
      Logger.error("Error checking today's claimed credits", {
        error: claimedError,
      });
      return NextResponse.json(
        { error: "Failed to check claimed credits" },
        { status: 500 }
      );
    }

    const todayClaimed =
      claimedData?.reduce((sum, record) => sum + record.credits_claimed, 0) ||
      0;

    // Get current credits from database
    const { data: creditsData, error: creditsError } = await supabaseServer
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (creditsError && creditsError.code !== "PGRST116") {
      Logger.error("Error fetching current credits", { error: creditsError });
      return NextResponse.json(
        { error: "Failed to fetch credit balance" },
        { status: 500 }
      );
    }

    const currentCredits = creditsData?.credits || 0;

    return NextResponse.json({
      hasClaimedToday,
      todayUsageCount,
      todayPurchased,
      todayClaimed,
      claimableCredits: hasClaimedToday ? 0 : 2,
      currentCredits,
      nextClaimDate: hasClaimedToday
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : today,
    });
  } catch (error) {
    Logger.error("Error in daily credit status check", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

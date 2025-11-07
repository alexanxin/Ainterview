import { NextRequest, NextResponse } from "next/server";
import {
  getUsageAnalytics,
  getUserUsageAnalytics,
} from "@/lib/analytics-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let analytics;

    if (userId) {
      // Get user-specific analytics
      analytics = await getUserUsageAnalytics(userId);
    } else {
      // Get general analytics
      analytics = await getUsageAnalytics();
    }

    if (!analytics) {
      return NextResponse.json(
        { error: "Failed to load analytics data" },
        { status: 500 }
      );
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { supabaseServer } from "./supabase-server";
import { Logger } from "./logger";
import {
  PostgrestSingleResponse,
  PostgrestError,
  PostgrestResponse,
} from "@supabase/supabase-js";

// Define interfaces for analytics data
export interface UsageAnalytics {
  totalUsage: number;
  dailyUsage: DailyUsage[];
  actionBreakdown: ActionBreakdown[];
  userGrowth: UserGrowth[];
  paymentAnalytics: PaymentAnalytics;
}

export interface DailyUsage {
  date: string;
  count: number;
  creditsUsed: number;
}

export interface ActionBreakdown {
  action: string;
  count: number;
  percentage: number;
}

export interface UserGrowth {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface PaymentAnalytics {
  totalPayments: number;
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
}

// Fetch general usage analytics from the database
export async function getUsageAnalytics(): Promise<UsageAnalytics | null> {
  try {
    // Get total usage count
    // Execute the count query separately to ensure proper type inference
    const totalUsageResponse = await supabaseServer
      .from("usage_tracking")
      .select("*", { count: "exact", head: true });

    if (totalUsageResponse.error) {
      Logger.error("Error getting total usage count:", {
        error: totalUsageResponse.error.message,
      });
      return null;
    }

    const totalUsage = totalUsageResponse.count ?? 0; // Default to 0 if count is null

    // Get daily usage for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build and execute the daily usage query with proper method chaining
    const dailyUsageResponse = await supabaseServer
      .from("usage_tracking")
      .select("created_at, cost")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (dailyUsageResponse.error) {
      Logger.error("Error getting daily usage data:", {
        error: dailyUsageResponse.error.message,
      });
      return null;
    }

    const typedDailyUsageData: { created_at: string; cost: number }[] =
      dailyUsageResponse.data || [];

    // Process daily usage data
    const dailyUsageMap = new Map<
      string,
      { count: number; creditsUsed: number }
    >();

    typedDailyUsageData.forEach((record) => {
      const date = new Date(record.created_at).toISOString().split("T")[0];
      if (dailyUsageMap.has(date)) {
        const current = dailyUsageMap.get(date)!;
        dailyUsageMap.set(date, {
          count: current.count + 1,
          creditsUsed: current.creditsUsed + (record.cost || 0),
        });
      } else {
        dailyUsageMap.set(date, {
          count: 1,
          creditsUsed: record.cost || 0,
        });
      }
    });

    const dailyUsage: DailyUsage[] = Array.from(dailyUsageMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        creditsUsed: data.creditsUsed,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get action breakdown - need to fetch all records and process manually since Supabase doesn't support GROUP BY in the same way
    // Use 'is' with 'not' operator to find non-null values - correct syntax
    // Execute the query to get non-null actions - using is and filtering out nulls
    // Execute the query to get non-null actions directly
    const allUsageResponse = await supabaseServer
      .from("usage_tracking")
      .select("action")
      .not("action", "is", null);

    if (allUsageResponse.error) {
      Logger.error("Error getting all usage data for action breakdown:", {
        error: allUsageResponse.error.message,
      });
      return null;
    }

    const typedAllUsageData: { action: string }[] = allUsageResponse.data || [];

    // Process action breakdown manually
    const actionCountMap = new Map<string, number>();
    typedAllUsageData.forEach((record) => {
      const action = record.action;
      actionCountMap.set(action, (actionCountMap.get(action) || 0) + 1);
    });

    const totalActions = Array.from(actionCountMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    const actionBreakdown: ActionBreakdown[] = Array.from(
      actionCountMap.entries()
    )
      .filter(
        ([action]) => action === "batchEvaluate" || action === "analyzeAnswer"
      )
      .map(([action, count]) => ({
        action:
          action === "batchEvaluate"
            ? "Batch Evaluate"
            : action === "analyzeAnswer"
            ? "Analyze Answer"
            : action,
        count,
        percentage:
          totalActions > 0 ? Math.round((count / totalActions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // For user growth, we would query the profiles table
    const userGrowth: UserGrowth[] = []; // Placeholder for now

    // Calculate payment analytics based on actual usage costs
    const totalRevenue = Math.abs(
      dailyUsage.reduce((sum, day) => sum + day.creditsUsed, 0)
    );

    // Count days with usage as "successful payments" (any day with credits used)
    const successfulPayments = dailyUsage.filter(
      (day) => day.creditsUsed > 0
    ).length;

    const paymentAnalytics: PaymentAnalytics = {
      totalPayments: successfulPayments,
      totalRevenue,
      successfulPayments,
      failedPayments: 0, // Placeholder
      averagePaymentAmount:
        successfulPayments > 0 ? totalRevenue / successfulPayments : 0,
    };

    return {
      totalUsage: totalUsage || 0,
      dailyUsage,
      actionBreakdown,
      userGrowth,
      paymentAnalytics,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Logger.error("Error in getUsageAnalytics:", { error: errorMessage });
    return null;
  }
}

// Fetch user-specific usage analytics
export async function getUserUsageAnalytics(
  userId: string
): Promise<UsageAnalytics | null> {
  try {
    console.time(`Analytics: getUserUsageAnalytics for ${userId}`);

    // Get total usage count for user
    console.time(`Analytics: Get total usage count for ${userId}`);
    // Execute the user count query separately to ensure proper type inference
    const userCountResponse = await supabaseServer
      .from("usage_tracking")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (userCountResponse.error) {
      Logger.error("Error getting user total usage count:", {
        error: userCountResponse.error.message,
        userId,
      });
      return null;
    }

    const totalUsage = userCountResponse.count ?? 0; // Default to 0 if count is null
    console.timeEnd(`Analytics: Get total usage count for ${userId}`);

    // Get daily usage for the last 30 days for user
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.time(`Analytics: Get daily usage data for ${userId}`);
    // Execute the daily usage query for user with proper chaining
    const dailyUsageResult = await supabaseServer
      .from("usage_tracking")
      .select("created_at, cost")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });
    console.timeEnd(`Analytics: Get daily usage data for ${userId}`);

    if ("error" in dailyUsageResult && dailyUsageResult.error) {
      Logger.error("Error getting user daily usage data:", {
        error: dailyUsageResult.error.message,
        userId,
      });
      return null;
    }

    const typedDailyUsageData: { created_at: string; cost: number }[] =
      dailyUsageResult.data || [];

    // Process daily usage data
    const dailyUsageMap = new Map<
      string,
      { count: number; creditsUsed: number }
    >();

    typedDailyUsageData.forEach((record) => {
      const date = new Date(record.created_at).toISOString().split("T")[0];
      if (dailyUsageMap.has(date)) {
        const current = dailyUsageMap.get(date)!;
        dailyUsageMap.set(date, {
          count: current.count + 1,
          creditsUsed: current.creditsUsed + (record.cost || 0),
        });
      } else {
        dailyUsageMap.set(date, {
          count: 1,
          creditsUsed: record.cost || 0,
        });
      }
    });

    const dailyUsage: DailyUsage[] = Array.from(dailyUsageMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        creditsUsed: data.creditsUsed,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get action breakdown for user
    console.time(`Analytics: Get action breakdown for ${userId}`);
    const userActionResponse = await supabaseServer
      .from("usage_tracking")
      .select("action")
      .eq("user_id", userId)
      .not("action", "is", null);
    console.timeEnd(`Analytics: Get action breakdown for ${userId}`);

    if (userActionResponse.error) {
      Logger.error("Error getting user action breakdown:", {
        error: userActionResponse.error.message,
        userId,
      });
      return null;
    }

    const typedUserActionData: { action: string }[] =
      userActionResponse.data || [];

    // Process action breakdown manually
    const actionCountMap = new Map<string, number>();
    typedUserActionData.forEach((record) => {
      const action = record.action;
      actionCountMap.set(action, (actionCountMap.get(action) || 0) + 1);
    });

    const totalActions = Array.from(actionCountMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    const actionBreakdown: ActionBreakdown[] = Array.from(
      actionCountMap.entries()
    )
      .filter(
        ([action]) => action === "batchEvaluate" || action === "analyzeAnswer"
      )
      .map(([action, count]) => ({
        action:
          action === "batchEvaluate"
            ? "Batch Evaluate"
            : action === "analyzeAnswer"
            ? "Analyze Answer"
            : action,
        count,
        percentage:
          totalActions > 0 ? Math.round((count / totalActions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // For user growth, we would query the profiles table
    const userGrowth: UserGrowth[] = []; // Placeholder for now

    // Calculate payment analytics for user based on actual usage costs
    const totalRevenue = Math.abs(
      dailyUsage.reduce((sum, day) => sum + day.creditsUsed, 0)
    );

    // Count days with usage as "successful payments" (any day with credits used)
    const successfulPayments = dailyUsage.filter(
      (day) => day.creditsUsed > 0
    ).length;

    const paymentAnalytics: PaymentAnalytics = {
      totalPayments: successfulPayments,
      totalRevenue,
      successfulPayments,
      failedPayments: 0, // Placeholder
      averagePaymentAmount:
        successfulPayments > 0 ? totalRevenue / successfulPayments : 0,
    };

    console.timeEnd(`Analytics: getUserUsageAnalytics for ${userId}`);

    return {
      totalUsage: totalUsage || 0,
      dailyUsage,
      actionBreakdown,
      userGrowth,
      paymentAnalytics,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Logger.error("Error in getUserUsageAnalytics:", {
      error: errorMessage,
      userId,
    });
    return null;
  }
}

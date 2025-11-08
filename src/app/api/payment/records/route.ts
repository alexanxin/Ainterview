import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { Logger } from "@/lib/logger";

export interface PaymentRecord {
  id?: string;
  user_id: string;
  transaction_id: string;
  expected_amount: number;
  token: string;
  recipient: string;
  status: "pending" | "confirmed" | "failed";
  created_at?: string;
  updated_at?: string;
}

// POST /api/payment/records - Create a pending payment record
export async function POST(req: NextRequest) {
  try {
    const { user_id, transaction_id, expected_amount, token, recipient } =
      await req.json();

    if (
      !user_id ||
      !transaction_id ||
      !expected_amount ||
      !token ||
      !recipient
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user_id, transaction_id, expected_amount, token, recipient",
        },
        { status: 400 }
      );
    }

    Logger.info("Creating pending payment record", {
      user_id,
      transaction_id,
      expected_amount,
      token,
      recipient,
    });

    const { data, error } = await supabaseServer
      .from("payment_records")
      .insert({
        user_id,
        transaction_id,
        expected_amount,
        token,
        recipient,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      Logger.error("Error creating payment record:", error);
      return NextResponse.json(
        { error: "Failed to create payment record", details: error.message },
        { status: 500 }
      );
    }

    Logger.info("Payment record created successfully", {
      id: data.id,
      transaction_id,
      user_id,
    });

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error("Error in payment records POST:", { error: errorMessage });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/payment/records?transaction_id=xxx - Update payment record status
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transaction_id");

    if (!transactionId) {
      return NextResponse.json(
        { error: "transaction_id query parameter is required" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!status || !["confirmed", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status ('confirmed' or 'failed') is required" },
        { status: 400 }
      );
    }

    Logger.info("Updating payment record status", {
      transaction_id: transactionId,
      status,
    });

    const { error } = await supabaseServer
      .from("payment_records")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("transaction_id", transactionId);

    if (error) {
      Logger.error("Error updating payment record:", error);
      return NextResponse.json(
        { error: "Failed to update payment record", details: error.message },
        { status: 500 }
      );
    }

    Logger.info("Payment record updated successfully", {
      transaction_id: transactionId,
      status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error("Error in payment records PATCH:", { error: errorMessage });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/payment/records?transaction_id=xxx - Get payment record by transaction ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transaction_id");

    if (!transactionId) {
      return NextResponse.json(
        { error: "transaction_id query parameter is required" },
        { status: 400 }
      );
    }

    Logger.info("Fetching payment record", {
      transaction_id: transactionId,
    });

    const { data, error } = await supabaseServer
      .from("payment_records")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        Logger.info("Payment record not found", {
          transaction_id: transactionId,
        });
        return NextResponse.json(
          { error: "Payment record not found" },
          { status: 404 }
        );
      }
      Logger.error("Error fetching payment record:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment record", details: error.message },
        { status: 500 }
      );
    }

    Logger.info("Payment record fetched successfully", {
      id: data.id,
      transaction_id: transactionId,
      status: data.status,
    });

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error("Error in payment records GET:", { error: errorMessage });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

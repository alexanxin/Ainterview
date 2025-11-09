import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Validate an invitation code and mark it as used
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Invitation code is required" },
        { status: 400 }
      );
    }

    // For development, make validation simple
    if (process.env.NODE_ENV === "development") {
      // Check if code exists in database first
      const { data: codeData, error: fetchError } = await supabaseServer
        .from("invitation_codes")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .single();

      if (fetchError || !codeData) {
        return NextResponse.json(
          { error: "Invalid invitation code" },
          { status: 400 }
        );
      }

      // Check if expired
      if (new Date() > new Date(codeData.expires_at)) {
        return NextResponse.json(
          { error: "Invitation code has expired" },
          { status: 400 }
        );
      }

      // Check if used up
      if (codeData.usage_count >= codeData.max_uses) {
        return NextResponse.json(
          { error: "Invitation code has been fully used" },
          { status: 400 }
        );
      }

      // Mark as used
      await supabaseServer
        .from("invitation_codes")
        .update({
          usage_count: codeData.usage_count + 1,
          used_at: new Date().toISOString(),
        })
        .eq("id", codeData.id);

      return NextResponse.json({
        valid: true,
        codeInfo: {
          code: codeData.code,
          usage_count: codeData.usage_count + 1,
          max_uses: codeData.max_uses,
          expires_at: codeData.expires_at,
        },
      });
    }

    // Production: Use server-side function to validate and use the code
    const { data, error } = await supabaseServer.rpc("use_invitation_code", {
      code_param: code.trim().toUpperCase(),
    });

    if (error) {
      return NextResponse.json(
        { error: "Database error validating code" },
        { status: 500 }
      );
    }

    const result = data[0]; // RPC returns array with single result

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error_message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      codeInfo: result.code_info,
    });
  } catch (error) {
    console.error("Error validating invitation code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

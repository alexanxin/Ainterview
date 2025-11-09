import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Generate invitation codes
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { count = 1, description = "Generated invitation code" } =
      await request.json();

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: "Count must be between 1 and 100" },
        { status: 400 }
      );
    }

    const codes = [];

    for (let i = 0; i < count; i++) {
      const { data, error } = await supabaseServer
        .from("invitation_codes")
        .insert({
          code: generateSimpleCode(),
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days
          max_uses: 1,
          description,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to generate code ${i + 1}: ${error.message}` },
          { status: 500 }
        );
      }

      codes.push(data);
    }

    return NextResponse.json({
      success: true,
      codes,
    });
  } catch (error) {
    console.error("Error generating invitation codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Simple code generator function
function generateSimpleCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let code = "";

  // First 4 characters: letters
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Last 4 characters: numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

/*
COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
======================================================

This API endpoint is now disabled to allow direct access during the hackathon.
All invitation code management has been removed.

To restore after hackathon:
1. Remove this comment block (lines 1-8)
2. Uncomment the original code below
3. Test that invitation code management works again

Original endpoint code preserved below:
*/

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Get all invitation codes (admin function)
export async function GET(request: NextRequest) {
  // FOR HACKATHON - Return mock data
  try {
    // Return empty array or mock data
    return NextResponse.json({
      success: true,
      codes: [], // Empty array for hackathon
    });

    /* ORIGINAL GET CODE (commented out for hackathon):
    // In development, allow public access
    if (process.env.NODE_ENV === "development") {
      const { data, error } = await supabaseServer
        .from("invitation_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        codes: data || [],
      });
    }

    // Production: Check authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseServer
      .from("invitation_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      codes: data || [],
    });
    */
  } catch (error) {
    // FOR HACKATHON - Return mock data even on errors
    return NextResponse.json({
      success: true,
      codes: [],
    });
    /*
    console.error("Error fetching invitation codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    */
  }
}

// Generate invitation codes
export async function POST(request: NextRequest) {
  // FOR HACKATHON - Return mock generation
  try {
    const { count = 1, description = "Generated invitation code" } =
      await request.json();

    // Return mock generated codes
    const mockCodes = Array.from({ length: count }, (_, i) => ({
      id: `mock-${i + 1}`,
      code: `HACK${String(i + 1).padStart(3, "0")}`,
      description: description || "Generated invitation code",
      status: "active",
      expires_at: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year
      max_uses: 1,
      usage_count: 0,
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      codes: mockCodes,
    });

    /* ORIGINAL POST CODE (commented out for hackathon):
    const { count = 1, description = "Generated invitation code" } =
      await request.json();

    // In development, allow public code generation
    if (process.env.NODE_ENV !== "development") {
      // Production: Check authentication
      const authHeader = request.headers.get("authorization");
      if (!authHeader) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }

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
    */
  } catch (error) {
    // FOR HACKATHON - Return mock data even on errors
    return NextResponse.json({
      success: true,
      codes: [
        {
          id: "mock-error",
          code: "HACKATHON",
          description: "Mock code for error handling",
          status: "active",
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          max_uses: 1,
          usage_count: 0,
          created_at: new Date().toISOString(),
        },
      ],
    });
    /*
    console.error("Error generating invitation codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    */
  }
}

/*
Helper function preserved for restoration:
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
*/

/*
END OF COMMENTED OUT MAIN API ENDPOINT
=====================================
To restore: Remove this comment block and uncomment the original logic.
*/

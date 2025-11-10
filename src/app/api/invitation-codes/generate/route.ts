/*
COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
======================================================

This API endpoint is now disabled to allow direct access during the hackathon.
All invitation code generation has been removed.

To restore after hackathon:
1. Remove this comment block (lines 1-8)
2. Uncomment the original code below
3. Test that invitation code generation works again

Original endpoint code preserved below:
*/

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Generate invitation codes
export async function POST(request: NextRequest) {
  // FOR HACKATHON - Return mock generation
  try {
    const { count = 1, description = "Generated invitation code" } =
      await request.json();

    // Return mock generated codes
    const mockCodes = Array.from({ length: count }, (_, i) => ({
      code: `HACK${String(i + 1).padStart(3, "0")}`,
      description: description || "Generated invitation code",
      status: "active",
      expires_at: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year
      max_uses: 1000,
      usage_count: 0,
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      data: mockCodes,
      message: `${count} invitation codes generated successfully (mock data for hackathon)`,
    });

    /* ORIGINAL GENERATION CODE (commented out for hackathon):
    const { count = 1, description = "Generated invitation code" } =
      await request.json();

    const codes = Array.from({ length: count }, () => {
      const code = generateRandomCode();
      return {
        code,
        status: "active",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        max_uses: 1,
        usage_count: 0,
        description,
        created_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabaseServer
      .from("invitation_codes")
      .insert(codes)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to generate invitation codes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: `${count} invitation codes generated successfully`,
    });
    */
  } catch (error) {
    // FOR HACKATHON - Return mock data even on errors
    return NextResponse.json({
      data: [
        {
          code: "HACKATHON",
          description: "Hackathon access code",
          status: "active",
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          max_uses: 999999,
          usage_count: 0,
          created_at: new Date().toISOString(),
        },
      ],
      message: "Mock invitation code generated for hackathon",
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
const generateRandomCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
*/

/*
END OF COMMENTED OUT GENERATE ENDPOINT
=====================================
To restore: Remove this comment block and uncomment the original logic.
*/

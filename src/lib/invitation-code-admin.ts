/*
COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
======================================================

This admin service is now disabled to allow direct access during the hackathon.
All invitation code management has been removed.

To restore after hackathon:
1. Remove this comment block (lines 1-8)
2. Uncomment the original code below
3. Test that invitation code generation works again

Original admin service code preserved below:
*/

// Simple admin utility for generating invitation codes
// Just like other projects - generate codes and share them on social media

export interface InvitationCode {
  id: string;
  code: string;
  status: "active" | "used" | "expired";
  created_at: string;
  expires_at: string;
  used_at?: string;
  usage_count: number;
  max_uses: number;
  description?: string;
}

export class InvitationCodeAdmin {
  /**
   * Generate a batch of invitation codes
   * Perfect for sharing on social media!
   */
  static async generateBatch(
    count: number = 10,
    description = "Beta invitation"
  ): Promise<{
    success: boolean;
    codes: InvitationCode[];
    shareableText?: string;
    error?: string;
  }> {
    try {
      // FOR HACKATHON - Return mock codes
      const mockCodes = Array.from({ length: count }, (_, i) => ({
        id: `mock-${i + 1}`,
        code: `HACK${String(i + 1).padStart(3, "0")}`,
        status: "active" as const,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        usage_count: 0,
        max_uses: 1,
        description: description || "Beta invitation",
      }));

      return {
        success: true,
        codes: mockCodes,
        shareableText: this.generateShareableText(mockCodes),
      };

      /* ORIGINAL GENERATION CODE (commented out for hackathon):
      // Use the API to generate codes
      const response = await fetch("/api/invitation-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("supabase.auth.token") || ""
          }`,
        },
        body: JSON.stringify({ count, description }),
      });

      const data = await response.json();

      if (response.ok && data.codes) {
        // Create shareable text for social media
        const codes = data.codes;
        const shareableText = this.generateShareableText(codes);

        return {
          success: true,
          codes,
          shareableText,
        };
      } else {
        return {
          success: false,
          codes: [],
          error: data.error || "Failed to generate codes",
        };
      }
      */
    } catch (error) {
      // FOR HACKATHON - Return mock data even on errors
      const mockCodes = [
        {
          id: "mock-error",
          code: "HACKATHON",
          status: "active" as const,
          created_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          usage_count: 0,
          max_uses: 999999,
          description: "Mock code for error handling",
        },
      ];

      return {
        success: true,
        codes: mockCodes,
        shareableText: "Mock invitation codes for hackathon",
      };
      /*
      return {
        success: false,
        codes: [],
        error: "Network error generating codes",
      };
      */
    }
  }

  /**
   * Generate simple codes using the built-in function
   * This is the most straightforward approach
   */
  static generateSimpleCodes(count: number): string[] {
    // FOR HACKATHON - Return mock codes
    return Array.from(
      { length: count },
      (_, i) => `HACK${String(i + 1).padStart(3, "0")}`
    );

    /* ORIGINAL SIMPLE CODES (commented out for hackathon):
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      codes.push(this.generateSimpleCode());
    }

    return codes;
    */
  }

  /**
   * Generate a single simple code
   * Format: ABCD1234 (4 letters + 4 numbers)
   */
  private static generateSimpleCode(): string {
    // FOR HACKATHON - Return simple mock code
    return "HACKATHON";

    /* ORIGINAL CODE GENERATION (commented out for hackathon):
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
    */
  }

  /**
   * Generate social media shareable text
   */
  private static generateShareableText(codes: InvitationCode[]): string {
    // FOR HACKATHON - Return mock shareable text
    return `🎉 Get early access to Ainterview! \n\nUse these invitation codes:\n\n${codes
      .map((code, index) => `${index + 1}. ${code.code}\n`)
      .join(
        ""
      )}\n💡 Go to the website and enter any code above!\nLimited time - first come, first served! 🚀 (Mock for hackathon)`;

    /* ORIGINAL SHAREABLE TEXT (commented out for hackathon):
    let text = `🎉 Get early access to Ainterview! \n\n`;
    text += `Use these invitation codes:\n\n`;

    codes.forEach((code, index) => {
      text += `${index + 1}. ${code.code}\n`;
    });

    text += `\n💡 Go to the website and enter any code above!\n`;
    text += `Limited time - first come, first served! 🚀`;

    return text;
    */
  }

  /**
   * Get all invitation codes (for admin dashboard)
   */
  static async getAllCodes(): Promise<{
    success: boolean;
    codes: InvitationCode[];
    error?: string;
  }> {
    try {
      // FOR HACKATHON - Return empty array
      return {
        success: true,
        codes: [],
      };

      /* ORIGINAL GET ALL CODE (commented out for hackathon):
      const response = await fetch("/api/invitation-codes", {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("supabase.auth.token") || ""
          }`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          codes: data.codes || [],
        };
      } else {
        return {
          success: false,
          codes: [],
          error: data.error || "Failed to fetch codes",
        };
      }
      */
    } catch (error) {
      // FOR HACKATHON - Return empty array even on errors
      return {
        success: true,
        codes: [],
      };
      /*
      return {
        success: false,
        codes: [],
        error: "Network error fetching codes",
      };
      */
    }
  }

  /**
   * Test a single invitation code
   */
  static async testCode(code: string): Promise<{
    valid: boolean;
    error?: string;
    codeInfo?: any;
  }> {
    try {
      // FOR HACKATHON - Always return success
      return {
        valid: true,
        codeInfo: {
          code: code || "HACKATHON_ACCESS",
          usage_count: 0,
          max_uses: 999999,
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };

      /* ORIGINAL TEST CODE (commented out for hackathon):
      // Import the service to test
      const { InvitationCodeService } = await import(
        "@/lib/invitation-code-service"
      );
      return await InvitationCodeService.validateCode(code);
      */
    } catch (error) {
      // FOR HACKATHON - Even on errors, return success
      return {
        valid: true,
        codeInfo: {
          code: "HACKATHON_ACCESS",
          usage_count: 0,
          max_uses: 999999,
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };
      /*
      return {
        valid: false,
        error: "Error testing code",
      };
      */
    }
  }
}

// Export for easy console access
if (typeof window !== "undefined") {
  (window as any).InvitationCodeAdmin = InvitationCodeAdmin;
}

/*
END OF COMMENTED OUT ADMIN SERVICE
==================================
To restore: Remove this comment block and uncomment the original logic.
*/

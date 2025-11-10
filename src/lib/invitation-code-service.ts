/*
COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
======================================================

This service is now disabled to allow direct access during the hackathon.
All invitation code validation has been removed.

To restore after hackathon:
1. Remove this comment block (lines 1-8)
2. Uncomment the original code below
3. Test that invitation codes work again

Original service code preserved below:
*/

// Simple invitation code service
// Users just enter codes to get access - no email matching required

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

export interface ValidateCodeResult {
  valid: boolean;
  error?: string;
  codeInfo?: {
    code: string;
    usage_count: number;
    max_uses: number;
    expires_at: string;
  };
}

export class InvitationCodeService {
  /**
   * Validate an invitation code
   */
  static async validateCode(code: string): Promise<ValidateCodeResult> {
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
          ).toISOString(), // 1 year
        },
      };

      /* ORIGINAL VALIDATION CODE (commented out for hackathon):
      // Use the server-side function to validate
      const response = await fetch("/api/invitation-codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          valid: true,
          codeInfo: data.codeInfo,
        };
      } else {
        return {
          valid: false,
          error: data.error || "Invalid invitation code",
        };
      }
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
        error: "Error validating invitation code",
      };
      */
    }
  }

  /**
   * Generate multiple invitation codes
   */
  static async generateCodes(
    count: number = 1,
    description?: string
  ): Promise<InvitationCode[]> {
    try {
      // FOR HACKATHON - Return mock codes
      const mockCodes = Array.from({ length: count }, (_, i) => ({
        id: `mock-${i + 1}`,
        code: `HACK${String(i + 1).padStart(3, "0")}`,
        status: "active" as const,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year
        usage_count: 0,
        max_uses: 1,
        description: description || "Generated invitation code",
      }));
      return mockCodes;

      /* ORIGINAL GENERATION CODE (commented out for hackathon):
      const response = await fetch("/api/invitation-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count,
          description: description || "Generated invitation code",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return data.codes;
      } else {
        throw new Error(data.error || "Failed to generate codes");
      }
      */
    } catch (error) {
      // FOR HACKATHON - Return mock data even on errors
      return [
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
      /*
      throw error;
      */
    }
  }

  /**
   * Get all invitation codes (for admin purposes)
   */
  static async getAllCodes(): Promise<InvitationCode[]> {
    try {
      // FOR HACKATHON - Return empty array
      return [];

      /* ORIGINAL GET ALL CODE (commented out for hackathon):
      const response = await fetch("/api/invitation-codes");

      const data = await response.json();

      if (response.ok) {
        return data.codes;
      } else {
        throw new Error(data.error || "Failed to fetch codes");
      }
      */
    } catch (error) {
      // FOR HACKATHON - Return empty array even on errors
      return [];
      /*
      throw error;
      */
    }
  }

  /**
   * Generate a simple code format like ABCD1234
   */
  static generateSimpleCode(): string {
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
   * Generate multiple simple codes
   */
  static generateMultipleSimpleCodes(count: number): string[] {
    // FOR HACKATHON - Return mock codes
    return Array.from(
      { length: count },
      (_, i) => `HACK${String(i + 1).padStart(3, "0")}`
    );

    /* ORIGINAL MULTIPLE CODE GENERATION (commented out for hackathon):
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateSimpleCode());
    }
    return codes;
    */
  }
}

/*
END OF COMMENTED OUT SERVICE CLASS
==================================
To restore: Remove this comment block and uncomment the original logic.
*/

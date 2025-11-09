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
    } catch (error) {
      return {
        success: false,
        codes: [],
        error: "Network error generating codes",
      };
    }
  }

  /**
   * Generate simple codes using the built-in function
   * This is the most straightforward approach
   */
  static generateSimpleCodes(count: number): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      codes.push(this.generateSimpleCode());
    }

    return codes;
  }

  /**
   * Generate a single simple code
   * Format: ABCD1234 (4 letters + 4 numbers)
   */
  private static generateSimpleCode(): string {
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

  /**
   * Generate social media shareable text
   */
  private static generateShareableText(codes: InvitationCode[]): string {
    let text = `🎉 Get early access to Ainterview! \n\n`;
    text += `Use these invitation codes:\n\n`;

    codes.forEach((code, index) => {
      text += `${index + 1}. ${code.code}\n`;
    });

    text += `\n💡 Go to the website and enter any code above!\n`;
    text += `Limited time - first come, first served! 🚀`;

    return text;
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
    } catch (error) {
      return {
        success: false,
        codes: [],
        error: "Network error fetching codes",
      };
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
      // Import the service to test
      const { InvitationCodeService } = await import(
        "@/lib/invitation-code-service"
      );
      return await InvitationCodeService.validateCode(code);
    } catch (error) {
      return {
        valid: false,
        error: "Error testing code",
      };
    }
  }
}

// Export for easy console access
if (typeof window !== "undefined") {
  (window as any).InvitationCodeAdmin = InvitationCodeAdmin;
}

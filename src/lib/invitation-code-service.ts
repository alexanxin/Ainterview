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
    } catch (error) {
      return {
        valid: false,
        error: "Error validating invitation code",
      };
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all invitation codes (for admin purposes)
   */
  static async getAllCodes(): Promise<InvitationCode[]> {
    try {
      const response = await fetch("/api/invitation-codes");

      const data = await response.json();

      if (response.ok) {
        return data.codes;
      } else {
        throw new Error(data.error || "Failed to fetch codes");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate a simple code format like ABCD1234
   */
  static generateSimpleCode(): string {
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
   * Generate multiple simple codes
   */
  static generateMultipleSimpleCodes(count: number): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateSimpleCode());
    }
    return codes;
  }
}

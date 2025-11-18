import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  rateLimiters,
  getRateLimitIdentifier,
  getEndpointType,
  createRateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limiter";

// This middleware handles rate limiting for API routes
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
    try {
      const endpointType = getEndpointType(pathname);
      // Map endpoint types to rate limiter keys
      const limiterKeyMap: Record<string, keyof typeof rateLimiters> = {
        CREDIT_CHECK: "creditCheck",
        PAYMENT: "payment",
        WEBHOOK: "webhook",
        USER_CREDITS: "userCredits",
        GENERAL: "general",
      };
      const rateLimiter =
        rateLimiters[limiterKeyMap[endpointType] || "general"];

      // Check if this is an authenticated request (has authorization header)
      const authHeader = request.headers.get("authorization");
      const isAuthenticated = !!authHeader;

      // For sensitive endpoints, use user-based limiting if authenticated
      const useUserId =
        isAuthenticated &&
        (endpointType === "CREDIT_CHECK" ||
          endpointType === "PAYMENT" ||
          endpointType === "USER_CREDITS");

      let identifier: string;
      let limiterConfig: { requests: number; window: string };

      if (useUserId) {
        // For authenticated sensitive endpoints, we need to extract user ID
        // This is a simplified approach - in production, you'd validate the JWT
        try {
          const token = authHeader!.split(" ")[1]; // Bearer token
          // Note: In production, you'd decode and validate the JWT here
          // For now, we'll use a hash of the token as identifier
          identifier = `user:${Buffer.from(token.substring(0, 16)).toString(
            "base64"
          )}`;
          limiterConfig = RATE_LIMITS[endpointType].authenticated;
        } catch {
          // Fallback to IP-based limiting if token parsing fails
          identifier = getRateLimitIdentifier(request);
          limiterConfig = RATE_LIMITS[endpointType].unauthenticated;
        }
      } else {
        identifier = getRateLimitIdentifier(request);
        // Use unauthenticated limits for non-sensitive endpoints or unauthenticated requests
        limiterConfig =
          endpointType === "GENERAL" || endpointType === "WEBHOOK"
            ? RATE_LIMITS[endpointType]
            : RATE_LIMITS[endpointType].unauthenticated;
      }

      console.log(
        `🔍 Applying rate limiting for ${pathname}, endpointType: ${endpointType}, identifier: ${identifier}`
      );

      // Apply rate limiting
      const { success, limit, remaining, reset } = await rateLimiter.limit(
        identifier
      );

      console.log(
        `📊 Rate limit result: success=${success}, limit=${limit}, remaining=${remaining}, reset=${reset}`
      );

      if (!success) {
        console.log(
          `🚫 Rate limit exceeded for ${pathname}, identifier: ${identifier}`
        );
        return createRateLimitResponse(reset, limit);
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", reset.toString());

      console.log(
        `✅ Rate limit passed for ${pathname}, remaining: ${remaining}/${limit}`
      );
      return response;
    } catch (error) {
      console.error("🔒 Rate limiting error:", error);
      // Continue with request if rate limiting fails
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

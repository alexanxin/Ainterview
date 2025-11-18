import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Simple in-memory rate limiter for development/testing
class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  constructor(private requests: number, private windowMs: number) {}

  async limit(identifier: string) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const key = `${identifier}:${Math.floor(now / this.windowMs)}`;

    let record = this.store.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + this.windowMs };
      this.store.set(key, record);
    }

    record.count++;
    const success = record.count <= this.requests;
    const remaining = Math.max(0, this.requests - record.count);
    const reset = Math.ceil(record.resetTime / 1000);

    return {
      success,
      limit: this.requests,
      remaining,
      reset,
    };
  }
}

// Initialize Redis client for Upstash (with fallback for development)
let redis: Redis;
let useInMemory = false;

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn(
      "⚠️  Upstash Redis not configured, using in-memory fallback for rate limiting"
    );
    useInMemory = true;
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
  useInMemory = true;
}

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  // General API limits (per IP)
  GENERAL: {
    requests: 100,
    window: "15 m", // 15 minutes
  },

  // Credit checking endpoints (reasonable limits for interview workflow)
  CREDIT_CHECK: {
    authenticated: { requests: 30, window: "1 m" }, // 30 per minute for authenticated users
    unauthenticated: { requests: 20, window: "1 m" }, // 20 per minute for unauthenticated IPs (for interview sessions)
  },

  // Payment endpoints (allow payment workflow completion)
  PAYMENT: {
    authenticated: { requests: 20, window: "1 m" }, // 20 per minute for authenticated users (allow multiple payment attempts)
    unauthenticated: { requests: 10, window: "1 m" }, // 10 per minute for unauthenticated IPs (allow payment workflow)
  },

  // Webhook endpoints (handle blockchain network activity)
  WEBHOOK: {
    requests: 50,
    window: "1 m", // 50 per minute to handle network activity
  },

  // User credits endpoint
  USER_CREDITS: {
    authenticated: { requests: 60, window: "1 m" }, // 60 per minute for authenticated users (for UI updates)
    unauthenticated: { requests: 30, window: "1 m" }, // 30 per minute for unauthenticated IPs (for UI updates)
  },
} as const;

// Helper function to parse window string to milliseconds
const parseWindow = (window: string): number => {
  const match = window.match(
    /^(\d+)\s*(m|minute|minutes|h|hour|hours|s|second|seconds)$/
  );
  if (!match) return 60000; // Default 1 minute

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
    case "second":
    case "seconds":
      return value * 1000;
    case "m":
    case "minute":
    case "minutes":
      return value * 60 * 1000;
    case "h":
    case "hour":
    case "hours":
      return value * 60 * 60 * 1000;
    default:
      return 60000;
  }
};

// Create rate limiter based on configuration (using in-memory for simplicity)
const createRateLimiter = (config: { requests: number; window: string }) => {
  const windowMs = parseWindow(config.window);
  return new InMemoryRateLimiter(config.requests, windowMs);
};

// Initialize rate limiters
export const rateLimiters = {
  // General API rate limiter (per IP)
  general: createRateLimiter(RATE_LIMITS.GENERAL),

  // Credit check rate limiter (per user/IP) - using unauthenticated limits for now
  creditCheck: createRateLimiter(RATE_LIMITS.CREDIT_CHECK.unauthenticated),

  // Payment rate limiter (per user/IP) - using unauthenticated limits for now
  payment: createRateLimiter(RATE_LIMITS.PAYMENT.unauthenticated),

  // Webhook rate limiter (per IP)
  webhook: createRateLimiter(RATE_LIMITS.WEBHOOK),

  // User credits rate limiter (per user/IP) - using unauthenticated limits for now
  userCredits: createRateLimiter(RATE_LIMITS.USER_CREDITS.unauthenticated),
};

// Rate limit response headers
export const RATE_LIMIT_HEADERS = {
  "X-RateLimit-Limit": "X-RateLimit-Limit",
  "X-RateLimit-Remaining": "X-RateLimit-Remaining",
  "X-RateLimit-Reset": "X-RateLimit-Reset",
  "Retry-After": "Retry-After",
} as const;

// Rate limit error response
export const createRateLimitResponse = (resetTime: number, limit: number) => {
  const resetDate = new Date(resetTime * 1000);

  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((resetTime * 1000 - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Reset": resetTime.toString(),
        "Retry-After": Math.ceil(
          (resetTime * 1000 - Date.now()) / 1000
        ).toString(),
      },
    }
  );
};

// Helper function to get rate limit identifier
export const getRateLimitIdentifier = (
  request: Request,
  userId?: string,
  useUserId: boolean = false
): string => {
  if (useUserId && userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return `ip:${ip}`;
};

// Helper function to check if endpoint is sensitive
export const getEndpointType = (pathname: string): keyof typeof RATE_LIMITS => {
  if (pathname.includes("/api/credits/check")) {
    return "CREDIT_CHECK";
  }
  if (pathname.includes("/api/payment/")) {
    return "PAYMENT";
  }
  if (pathname.includes("/api/webhook/")) {
    return "WEBHOOK";
  }
  if (pathname.includes("/api/user/credits")) {
    return "USER_CREDITS";
  }
  return "GENERAL";
};

// Rate limiter utility to handle API calls with proper throttling
export class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 60, windowMs = 60000) {
    // Default: 60 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public isAllowed(key: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(key) || [];

    // Remove calls that are outside the window
    const validCalls = calls.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validCalls.length >= this.maxRequests) {
      return false;
    }

    // Add current call
    validCalls.push(now);
    this.calls.set(key, validCalls);

    return true;
  }

  public async waitForAvailable(
    key: string,
    maxWaitTime: number = 30000
  ): Promise<void> {
    const startTime = Date.now();

    while (!this.isAllowed(key)) {
      // Check if we've exceeded the maximum wait time
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error(
          `Rate limit exceeded and maximum wait time of ${maxWaitTime}ms reached for key: ${key}`
        );
      }

      // Calculate time until the oldest call falls out of the window
      const calls = this.calls.get(key) || [];
      if (calls.length > 0) {
        const oldestCall = Math.min(...calls);
        const timeUntilAvailable = oldestCall + this.windowMs - Date.now();

        // Wait for the minimum time needed or 1 second, whichever is smaller
        const waitTime = Math.min(timeUntilAvailable, 1000);
        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      } else {
        // If there are no calls recorded, break the loop
        break;
      }
    }
  }

  // Method to get rate limit info without blocking
  public getRateLimitInfo(key: string): {
    remaining: number;
    resetTime: number;
    timeToReset: number;
  } {
    const now = Date.now();
    const calls = this.calls.get(key) || [];

    // Remove calls that are outside the window
    const validCalls = calls.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    const remaining = Math.max(0, this.maxRequests - validCalls.length);
    const nextResetTime =
      calls.length > 0 ? Math.min(...calls) + this.windowMs : now;
    const timeToReset = Math.max(0, nextResetTime - now);

    return {
      remaining,
      resetTime: nextResetTime,
      timeToReset,
    };
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute for Gemini API - more conservative

// Function to implement exponential backoff for retrying failed requests
export const withExponentialBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 5, // Increased to 5 retries for more attempts
  baseDelay: number = 2000, // 2 seconds base delay - more conservative
  maxDelay: number = 3000 // 30 seconds max delay - increased for more patience
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error as Error;

      // Check if it's an API error with status 429
      const isRateLimitError =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status: number }).status === 429;

      // If this is the last attempt or it's not a rate limit error, re-throw
      if (attempt === maxRetries || !isRateLimitError) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.5 * exponentialDelay; // Add up to 50% jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      console.log(
        `Rate limit hit, retrying in ${Math.round(delay)}ms (attempt ${
          attempt + 1
        }/${maxRetries})`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Enhanced rate limiting function that provides detailed rate limit information
export const withRateLimitHandling = async <T>(
  operation: () => Promise<T>,
  rateLimitKey: string,
  maxWaitTime: number = 30000
): Promise<T> => {
  // First, wait for rate limit availability
  try {
    await rateLimiter.waitForAvailable(rateLimitKey, maxWaitTime);
  } catch (error) {
    console.error(`Rate limit exceeded for key ${rateLimitKey}:`, error);
    throw new Error(
      `Rate limit exceeded: ${
        error instanceof Error
          ? error.message
          : "Timeout waiting for rate limit availability"
      }`
    );
  }

  // Execute the operation with backoff handling
  return await withExponentialBackoff(operation);
};

// lib/validations-enhanced.ts - Enhanced input validation and sanitization
import { z } from "zod";
import {
  sanitizeJobPosting,
  sanitizeUserCV,
  sanitizeUserAnswer,
  recordSanitization,
} from "./dompurify-enhanced";

export const UserProfileSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(1000).optional(),
  experience: z.string().max(5000).optional(),
  education: z.string().max(3000).optional(),
  skills: z.string().max(1000).optional(),
});

export const InterviewContextSchema = z.object({
  jobPosting: z.string().min(10).max(10000),
  companyInfo: z.string().min(10).max(5000),
  userCv: z.string().min(10).max(10000),
});

// Performance comparison tracking
const BASIC_SANITIZE_BENCHMARK = (input: string): string => {
  const startTime = performance.now();
  const threatsBlocked =
    (input.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi) || [])
      .length + (input.match(/javascript:/gi) || []).length;

  const result = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .trim();

  const endTime = performance.now();
  recordSanitization(
    "basic",
    endTime - startTime,
    input.length,
    threatsBlocked
  );

  return result;
};

// Enhanced sanitization for different content types
export const sanitizeJobPostingSafe = (content: string): string => {
  const result = sanitizeJobPosting(content);
  return result.sanitized;
};

export const sanitizeUserCVSafe = (content: string): string => {
  const result = sanitizeUserCV(content);
  return result.sanitized;
};

export const sanitizeUserAnswerSafe = (content: string): string => {
  const result = sanitizeUserAnswer(content);
  return result.sanitized;
};

// Legacy sanitization (enhanced with performance tracking)
export const sanitizeInput = (input: string): string => {
  // Use enhanced DOMPurify sanitization with fallback to legacy method
  if (typeof window !== "undefined") {
    // Try DOMPurify sanitization first (more secure)
    const result = sanitizeUserAnswerSafe(input);
    return result;
  } else {
    // Server-side: Use basic sanitization with tracking
    return BASIC_SANITIZE_BENCHMARK(input);
  }
};

// Validation functions with enhanced security
export const validateUserProfile = (data: any) => {
  return UserProfileSchema.parse(data);
};

export const validateInterviewContext = (data: any) => {
  return InterviewContextSchema.parse(data);
};

// Enhanced validation for user-generated content
export const validateAndSanitizeJobPosting = (content: string) => {
  const validation = InterviewContextSchema.shape.jobPosting.safeParse(content);
  if (!validation.success) {
    throw new Error(`Invalid job posting: ${validation.error.message}`);
  }

  const sanitized = sanitizeJobPostingSafe(content);
  return {
    original: content,
    sanitized,
    validation: validation.success,
    threatsDetected: sanitizeJobPosting(content).threatsDetected,
  };
};

export const validateAndSanitizeUserCV = (content: string) => {
  const validation = InterviewContextSchema.shape.userCv.safeParse(content);
  if (!validation.success) {
    throw new Error(`Invalid CV content: ${validation.error.message}`);
  }

  const sanitized = sanitizeUserCVSafe(content);
  return {
    original: content,
    sanitized,
    validation: validation.success,
    threatsDetected: sanitizeUserCV(content).threatsDetected,
  };
};

// More relaxed validation for CV analysis (doesn't require min length)
export const validateAndSanitizeUserCVForAnalysis = (content: string) => {
  try {
    // Only check that it's a string and not excessively long
    if (typeof content !== "string") {
      throw new Error("CV content must be a string");
    }
    if (content.length > 50000) {
      // Allow longer content for analysis
      throw new Error("CV content is too long (max 50,000 characters)");
    }

    const sanitized = sanitizeUserCVSafe(content);
    const fullResult = sanitizeUserCV(content);

    return {
      original: content,
      sanitized,
      validation: true,
      threatsDetected: fullResult.threatsDetected,
    };
  } catch (error) {
    // Ensure we throw proper Error objects, not empty objects
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`CV validation failed: ${String(error)}`);
    }
  }
};

export const validateAndSanitizeUserAnswer = (content: string) => {
  // User answers don't have specific schema validation but should be sanitized
  const sanitized = sanitizeUserAnswerSafe(content);
  return {
    original: content,
    sanitized,
    threatsDetected: sanitizeUserAnswer(content).threatsDetected,
  };
};

// Utility for comprehensive input sanitization
export interface SanitizationResult {
  original: string;
  sanitized: string;
  threatsDetected: string[];
  validationPassed: boolean;
  performance: { time: number };
}

export const comprehensiveSanitize = (
  content: string,
  contentType: "job" | "cv" | "answer"
): SanitizationResult => {
  const startTime = performance.now();
  let sanitized: string;
  let threatsDetected: string[];

  switch (contentType) {
    case "job":
      const jobResult = sanitizeJobPosting(content);
      sanitized = jobResult.sanitized;
      threatsDetected = jobResult.threatsDetected;
      break;
    case "cv":
      const cvResult = sanitizeUserCV(content);
      sanitized = cvResult.sanitized;
      threatsDetected = cvResult.threatsDetected;
      break;
    case "answer":
      const answerResult = sanitizeUserAnswer(content);
      sanitized = answerResult.sanitized;
      threatsDetected = answerResult.threatsDetected;
      break;
  }

  const endTime = performance.now();

  return {
    original: content,
    sanitized,
    threatsDetected,
    validationPassed: threatsDetected.length === 0,
    performance: { time: endTime - startTime },
  };
};

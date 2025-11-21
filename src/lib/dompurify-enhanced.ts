// lib/dompurify-enhanced.ts - Enhanced DOMPurify integration for Ainterview
import DOMPurify from "dompurify";

// DOMPurify configuration interface
interface DOMPurifyConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  KEEP_CONTENT?: boolean;
}

// Safe DOMPurify instance - works in browser and server with minimal setup
const getPurify = (): DOMPurifyInstance => {
  // In browser or when DOM is available, DOMPurify works directly
  if (typeof window !== "undefined" && window.document) {
    return DOMPurify;
  }

  // Server-side safety check - if no DOM, provide basic sanitization fallback
  // This can happen in certain SSR environments where no DOM is available
  if (typeof globalThis !== "undefined" && !globalThis.document) {
    console.warn(
      "DOMPurify running in server environment without DOM - using basic sanitization fallback"
    );
    return {
      sanitize: (input: string, config?: DOMPurifyConfig) => {
        // Basic HTML tag removal as fallback for server-side without DOM
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
          .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/\bon\w+=/gi, "")
          .trim();
      },
    };
  }

  // Default: use DOMPurify - it should handle server-side DOM environments
  return DOMPurify;
};

// DOMPurify interface to avoid type issues
interface DOMPurifyInstance {
  sanitize: (input: string, config?: DOMPurifyConfig) => string;
}

// Enhanced sanitization for job postings and CV content
export const sanitizeJobPosting = (
  content: string
): {
  sanitized: string;
  threatsDetected: string[];
  performance: { time: number };
} => {
  const startTime = performance.now();
  const threatsDetected: string[] = [];

  // Detect common XSS patterns
  const threatPatterns = [
    {
      name: "Script tags",
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    },
    { name: "Event handlers", pattern: /\bon\w+=/gi },
    { name: "JavaScript protocol", pattern: /javascript:/gi },
    { name: "Iframe injection", pattern: /<iframe\b[^<]*>/gi },
    { name: "CSS expressions", pattern: /expression\s*\(/gi },
  ];

  threatPatterns.forEach(({ name, pattern }) => {
    const matches = content.match(pattern);
    if (matches) {
      threatsDetected.push(`${name}: ${matches.length} instances`);
    }
  });

  // Sanitize with strict configuration for job content
  const purify = getPurify();
  const sanitized = purify.sanitize(content, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "u",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "span",
      "div",
      "a",
    ],
    ALLOWED_ATTR: ["href", "title", "class"],
    FORBID_TAGS: ["style", "script", "iframe", "embed", "object", "form"],
    FORBID_ATTR: ["onclick", "onload", "onerror", "style", "src", "action"],
  });

  const endTime = performance.now();

  // Record performance data for monitoring
  recordSanitization(
    "dompurify",
    endTime - startTime,
    content.length,
    threatsDetected.length
  );

  return {
    sanitized,
    threatsDetected,
    performance: { time: endTime - startTime },
  };
};

// Enhanced sanitization for user CV content
export const sanitizeUserCV = (
  content: string
): {
  sanitized: string;
  threatsDetected: string[];
  performance: { time: number };
} => {
  const startTime = performance.now();
  const threatsDetected: string[] = [];

  // More permissive but still secure for CV content
  const threatPatterns = [
    {
      name: "Script tags",
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    },
    { name: "Event handlers", pattern: /\bon\w+=/gi },
    { name: "JavaScript protocol", pattern: /javascript:/gi },
  ];

  threatPatterns.forEach(({ name, pattern }) => {
    const matches = content.match(pattern);
    if (matches) {
      threatsDetected.push(`${name}: ${matches.length} instances`);
    }
  });

  const purify = getPurify();
  const sanitized = purify.sanitize(content, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "u",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "span",
      "div",
      "a",
      "ul",
      "ol",
    ],
    ALLOWED_ATTR: ["href", "title", "class"],
    FORBID_TAGS: ["style", "script", "iframe", "embed", "object"],
    FORBID_ATTR: ["onclick", "onload", "onerror", "style", "src", "action"],
  });

  const endTime = performance.now();

  // Record performance data for monitoring
  recordSanitization(
    "dompurify",
    endTime - startTime,
    content.length,
    threatsDetected.length
  );

  return {
    sanitized,
    threatsDetected,
    performance: { time: endTime - startTime },
  };
};

// Enhanced sanitization for user answers
export const sanitizeUserAnswer = (
  content: string
): {
  sanitized: string;
  threatsDetected: string[];
  performance: { time: number };
} => {
  const startTime = performance.now();
  const threatsDetected: string[] = [];

  // Strict sanitization for user answers
  const threatPatterns = [
    {
      name: "Script tags",
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    },
    { name: "Event handlers", pattern: /\bon\w+=/gi },
    { name: "JavaScript protocol", pattern: /javascript:/gi },
    { name: "Iframe injection", pattern: /<iframe\b[^<]*>/gi },
  ];

  threatPatterns.forEach(({ name, pattern }) => {
    const matches = content.match(pattern);
    if (matches) {
      threatsDetected.push(`${name}: ${matches.length} instances`);
    }
  });

  const purify = getPurify();
  const sanitized = purify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "p", "br"],
    ALLOWED_ATTR: ["title"],
    FORBID_TAGS: [
      "style",
      "script",
      "iframe",
      "embed",
      "object",
      "form",
      "ul",
      "ol",
      "li",
    ],
    FORBID_ATTR: [
      "onclick",
      "onload",
      "onerror",
      "style",
      "src",
      "action",
      "href",
      "class",
    ],
  });

  const endTime = performance.now();

  // Record performance data for monitoring
  recordSanitization(
    "dompurify",
    endTime - startTime,
    content.length,
    threatsDetected.length
  );

  return {
    sanitized,
    threatsDetected,
    performance: { time: endTime - startTime },
  };
};

// Performance comparison utilities
export interface PerformanceMetrics {
  method: "basic" | "dompurify";
  time: number;
  contentLength: number;
  threatsBlocked: number;
}

let performanceData: PerformanceMetrics[] = [];

export const recordSanitization = (
  method: PerformanceMetrics["method"],
  time: number,
  contentLength: number,
  threatsBlocked: number
) => {
  performanceData.push({ method, time, contentLength, threatsBlocked });
  // Keep only last 100 entries
  if (performanceData.length > 100) {
    performanceData.shift();
  }
};

export const getPerformanceComparison = () => {
  if (performanceData.length === 0) return null;

  const basicMethods = performanceData.filter((p) => p.method === "basic");
  const dompurifyMethods = performanceData.filter(
    (p) => p.method === "dompurify"
  );

  return {
    basic: {
      count: basicMethods.length,
      avgTime:
        basicMethods.reduce((sum, p) => sum + p.time, 0) / basicMethods.length,
      totalThreatsBlocked: basicMethods.reduce(
        (sum, p) => sum + p.threatsBlocked,
        0
      ),
    },
    dompurify: {
      count: dompurifyMethods.length,
      avgTime:
        dompurifyMethods.reduce((sum, p) => sum + p.time, 0) /
        dompurifyMethods.length,
      totalThreatsBlocked: dompurifyMethods.reduce(
        (sum, p) => sum + p.threatsBlocked,
        0
      ),
    },
    totalOperations: performanceData.length,
  };
};

export const clearPerformanceData = () => {
  performanceData = [];
};

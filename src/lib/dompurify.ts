// lib/dompurify.ts - DOMPurify utility wrapper with performance monitoring
import DOMPurify from "dompurify";

// DOMPurify configuration interface
interface DOMPurifyConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOWED_URI_REGEXP?: RegExp;
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  KEEP_CONTENT?: boolean;
}

// Server-side DOMPurify setup
const createDOMPurify = () => {
  if (typeof window !== "undefined") {
    // Client-side: Use the actual DOM
    return DOMPurify;
  } else {
    // Server-side: Use DOMPurify without window for Next.js
    return DOMPurify as any;
  }
};

const dompurify = createDOMPurify();

// Performance tracking utilities
interface PerformanceMetrics {
  sanitizeTime: number;
  originalLength: number;
  sanitizedLength: number;
  threatsBlocked: number;
}

// Performance monitoring
let performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS_ENTRIES = 100;

export const sanitizeHTML = (
  html: string,
  options?: DOMPurifyConfig
): string => {
  const startTime = performance.now();

  // Define secure configuration
  const defaultOptions: DOMPurifyConfig = {
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
      "a",
      "span",
      "div",
    ],
    ALLOWED_ATTR: ["href", "title", "class"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ["style", "script", "iframe", "embed", "object"],
    FORBID_ATTR: ["onclick", "onload", "onerror", "style", "src", "action"],
    KEEP_CONTENT: false,
  };

  const sanitized = dompurify.sanitize(html, {
    ...defaultOptions,
    ...options,
  }) as string;

  const endTime = performance.now();
  const originalLength = html.length;
  const sanitizedLength = sanitized.length;
  const threatsBlocked = originalLength - sanitizedLength;

  // Store performance metrics
  const metrics: PerformanceMetrics = {
    sanitizeTime: endTime - startTime,
    originalLength,
    sanitizedLength,
    threatsBlocked,
  };

  performanceMetrics.push(metrics);
  if (performanceMetrics.length > MAX_METRICS_ENTRIES) {
    performanceMetrics.shift();
  }

  return sanitized;
};

// Enhanced sanitization with threat detection
export const sanitizeInput = (
  input: string
): {
  sanitized: string;
  threatsDetected: string[];
  threatCount: number;
  performance: {
    time: number;
    originalLength: number;
    sanitizedLength: number;
  };
} => {
  const threatsDetected: string[] = [];
  const startTime = performance.now();

  // Threat detection patterns
  const threatPatterns = [
    {
      name: "Script Tags",
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    },
    { name: "JavaScript Protocol", pattern: /javascript:/gi },
    { name: "Event Handlers", pattern: /\bon\w+=/gi },
    {
      name: "Iframe Tags",
      pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    },
    {
      name: "Object Tags",
      pattern: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    },
    { name: "Embed Tags", pattern: /<embed\b[^<]*>/gi },
    { name: "Form Actions", pattern: /action\s*=\s*["']javascript:/gi },
    { name: "CSS Expression", pattern: /expression\s*\(/gi },
    { name: "Base64 XSS", pattern: /data:text\/html/gi },
  ];

  // Detect threats
  threatPatterns.forEach(({ name, pattern }) => {
    const matches = input.match(pattern);
    if (matches) {
      threatsDetected.push(`${name}: ${matches.length} instance(s)`);
    }
  });

  // Sanitize with DOMPurify
  const sanitized = sanitizeHTML(input);

  const endTime = performance.now();

  return {
    sanitized,
    threatsDetected,
    threatCount: threatsDetected.length,
    performance: {
      time: endTime - startTime,
      originalLength: input.length,
      sanitizedLength: sanitized.length,
    },
  };
};

// Legacy sanitization for backward compatibility (enhanced version)
export const sanitizeInputLegacy = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .trim();
};

// Performance analysis utilities
export const getSanitizationPerformance = () => {
  if (performanceMetrics.length === 0) return null;

  const avgTime =
    performanceMetrics.reduce((sum, m) => sum + m.sanitizeTime, 0) /
    performanceMetrics.length;
  const avgThreatsBlocked =
    performanceMetrics.reduce((sum, m) => sum + m.threatsBlocked, 0) /
    performanceMetrics.length;
  const totalThreatsBlocked = performanceMetrics.reduce(
    (sum, m) => sum + m.threatsBlocked,
    0
  );

  return {
    totalOperations: performanceMetrics.length,
    averageTimeMs: avgTime,
    totalThreatsBlocked,
    averageThreatsBlocked: avgThreatsBlocked,
    latestMetrics: performanceMetrics.slice(-5), // Last 5 operations
  };
};

// Clear performance metrics
export const clearPerformanceMetrics = () => {
  performanceMetrics = [];
};

// Security level configurations
export const SECURITY_LEVELS = {
  BASIC: {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "p", "br"],
    ALLOWED_ATTR: ["title"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onclick", "onload", "onerror", "style"],
  },
  MODERATE: {
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
    ],
    ALLOWED_ATTR: ["href", "title"],
    FORBID_TAGS: ["style", "script", "iframe", "embed", "object"],
    FORBID_ATTR: ["onclick", "onload", "onerror", "style", "src", "action"],
  },
  STRICT: {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "p", "br"],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ["style", "script", "iframe", "embed", "object", "form"],
    FORBID_ATTR: [
      "onclick",
      "onload",
      "onerror",
      "style",
      "src",
      "action",
      "href",
      "title",
    ],
  },
};

// Export the enhanced sanitize function as the default
export default sanitizeInput;

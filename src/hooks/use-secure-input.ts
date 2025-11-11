// hooks/use-secure-input.ts - Secure input handling hook with real-time sanitization
import { useState, useCallback, useEffect } from "react";
import {
  sanitizeJobPostingSafe,
  sanitizeUserCVSafe,
  sanitizeUserAnswerSafe,
  comprehensiveSanitize,
} from "@/lib/validations-enhanced";

interface UseSecureInputOptions {
  contentType: "job" | "cv" | "answer";
  maxLength?: number;
  realTimeSanitization?: boolean;
  enableThreatDetection?: boolean;
}

export interface SanitizationState {
  isSanitized: boolean;
  threatsDetected: string[];
  sanitizationTime: number;
  lastSanitized: string;
}

export const useSecureInput = ({
  contentType,
  maxLength = 10000,
  realTimeSanitization = true,
  enableThreatDetection = true,
}: UseSecureInputOptions) => {
  const [value, setValue] = useState("");
  const [sanitizationState, setSanitizationState] = useState<SanitizationState>(
    {
      isSanitized: true,
      threatsDetected: [],
      sanitizationTime: 0,
      lastSanitized: "",
    }
  );

  // Sanitization function based on content type
  const sanitizeContent = useCallback(
    (content: string) => {
      const startTime = performance.now();

      let sanitized: string;
      let threatsDetected: string[] = [];

      switch (contentType) {
        case "job":
          const jobResult = sanitizeJobPostingSafe(content);
          sanitized = jobResult;
          if (enableThreatDetection) {
            const jobAnalysis = comprehensiveSanitize(content, "job");
            threatsDetected = jobAnalysis.threatsDetected;
          }
          break;
        case "cv":
          const cvResult = sanitizeUserCVSafe(content);
          sanitized = cvResult;
          if (enableThreatDetection) {
            const cvAnalysis = comprehensiveSanitize(content, "cv");
            threatsDetected = cvAnalysis.threatsDetected;
          }
          break;
        case "answer":
          const answerResult = sanitizeUserAnswerSafe(content);
          sanitized = answerResult;
          if (enableThreatDetection) {
            const answerAnalysis = comprehensiveSanitize(content, "answer");
            threatsDetected = answerAnalysis.threatsDetected;
          }
          break;
        default:
          sanitized = content;
          break;
      }

      const endTime = performance.now();

      setSanitizationState({
        isSanitized: threatsDetected.length === 0,
        threatsDetected,
        sanitizationTime: endTime - startTime,
        lastSanitized: sanitized,
      });

      return sanitized;
    },
    [contentType, enableThreatDetection]
  );

  // Handle input changes with optional real-time sanitization
  const handleChange = useCallback(
    (newValue: string) => {
      // Limit length
      if (newValue.length > maxLength) {
        newValue = newValue.substring(0, maxLength);
      }

      setValue(newValue);

      if (realTimeSanitization) {
        const sanitizedValue = sanitizeContent(newValue);
        // Update the value with sanitized version if threats were detected
        if (sanitizedValue !== newValue) {
          setValue(sanitizedValue);
        }
      }
    },
    [maxLength, realTimeSanitization, sanitizeContent]
  );

  // Get the sanitized version of current value
  const getSanitizedValue = useCallback(() => {
    if (!realTimeSanitization) {
      return sanitizeContent(value);
    }
    return sanitizationState.lastSanitized || value;
  }, [
    value,
    realTimeSanitization,
    sanitizeContent,
    sanitizationState.lastSanitized,
  ]);

  // Validate if the current content is safe
  const isContentSafe = useCallback(() => {
    return (
      sanitizationState.isSanitized &&
      sanitizationState.threatsDetected.length === 0
    );
  }, [sanitizationState.isSanitized, sanitizationState.threatsDetected]);

  // Get threat analysis
  const getThreatAnalysis = useCallback(() => {
    if (!enableThreatDetection) {
      return { threatsDetected: [], severity: "none" as const };
    }

    const { threatsDetected } = sanitizationState;
    let severity: "low" | "medium" | "high" | "none" = "none";

    if (threatsDetected.length > 0) {
      const highSeverityThreats = threatsDetected.filter(
        (threat) =>
          threat.includes("script") ||
          threat.includes("javascript") ||
          threat.includes("onerror")
      );
      const mediumSeverityThreats = threatsDetected.filter(
        (threat) =>
          threat.includes("iframe") ||
          threat.includes("object") ||
          threat.includes("embed")
      );

      if (highSeverityThreats.length > 0) {
        severity = "high";
      } else if (mediumSeverityThreats.length > 0) {
        severity = "medium";
      } else {
        severity = "low";
      }
    }

    return { threatsDetected, severity };
  }, [sanitizationState, enableThreatDetection]);

  // Force sanitization (useful for form submission)
  const forceSanitize = useCallback(() => {
    const sanitizedValue = sanitizeContent(value);
    setValue(sanitizedValue);
    return sanitizedValue;
  }, [value, sanitizeContent]);

  // Reset sanitization state
  const resetSanitization = useCallback(() => {
    setSanitizationState({
      isSanitized: true,
      threatsDetected: [],
      sanitizationTime: 0,
      lastSanitized: "",
    });
  }, []);

  return {
    value,
    setValue: handleChange,
    sanitizationState,
    isContentSafe: isContentSafe(),
    getSanitizedValue,
    getThreatAnalysis,
    forceSanitize,
    resetSanitization,
  };
};

// Hook for secure form submission
export const useSecureForm = (contentType: "job" | "cv" | "answer") => {
  const secureInput = useSecureInput({
    contentType,
    realTimeSanitization: false,
    enableThreatDetection: true,
  });

  const validateAndSanitize = useCallback(() => {
    const sanitizedValue = secureInput.forceSanitize();
    const threatAnalysis = secureInput.getThreatAnalysis();

    return {
      isValid: threatAnalysis.threatsDetected.length === 0,
      value: sanitizedValue,
      threatsDetected: threatAnalysis.threatsDetected,
      severity: threatAnalysis.severity,
      sanitizationTime: secureInput.sanitizationState.sanitizationTime,
    };
  }, [secureInput]);

  return {
    ...secureInput,
    validateAndSanitize,
  };
};

export default useSecureInput;

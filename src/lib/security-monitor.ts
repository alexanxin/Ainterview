// lib/security-monitor.ts - Security monitoring and threat detection utilities
import { getPerformanceComparison } from "./dompurify-enhanced";

export interface SecurityEvent {
  timestamp: string;
  type:
    | "xss_attempt"
    | "script_injection"
    | "dom_manipulation"
    | "sanitization_block";
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  details: string;
  userId?: string;
  ip?: string;
}

export interface SecurityMetrics {
  totalThreatsBlocked: number;
  threatsByType: Record<string, number>;
  threatsBySeverity: Record<string, number>;
  averageSanitizationTime: number;
  lastThreatDetected: string | null;
  securityScore: number; // 0-100, higher is better
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * Log a security event
   */
  public logEvent(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.unshift(fullEvent);

    // Keep only the most recent events to prevent memory issues
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log to console for development
    if (process.env.NODE_ENV === "development") {
      console.warn("🔒 Security Event:", fullEvent);
    }
  }

  /**
   * Record XSS attempt
   */
  public recordXSSAttempt(
    source: string,
    details: string,
    userId?: string
  ): void {
    this.logEvent({
      type: "xss_attempt",
      severity: "high",
      source,
      details,
      userId,
    });
  }

  /**
   * Record script injection attempt
   */
  public recordScriptInjection(
    source: string,
    details: string,
    userId?: string
  ): void {
    this.logEvent({
      type: "script_injection",
      severity: "critical",
      source,
      details,
      userId,
    });
  }

  /**
   * Record successful sanitization
   */
  public recordSanitization(
    source: string,
    originalLength: number,
    sanitizedLength: number
  ): void {
    if (originalLength !== sanitizedLength) {
      this.logEvent({
        type: "sanitization_block",
        severity: "medium",
        source,
        details: `Removed ${originalLength - sanitizedLength} characters`,
      });
    }
  }

  /**
   * Get security events filtered by criteria
   */
  public getEvents(filters?: {
    type?: SecurityEvent["type"];
    severity?: SecurityEvent["severity"];
    source?: string;
    userId?: string;
    since?: string; // ISO date string
    limit?: number;
  }): SecurityEvent[] {
    let filtered = [...this.events];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter((e) => e.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter((e) => e.severity === filters.severity);
      }
      if (filters.source) {
        filtered = filtered.filter((e) => e.source.includes(filters.source!));
      }
      if (filters.userId) {
        filtered = filtered.filter((e) => e.userId === filters.userId);
      }
      if (filters.since) {
        const sinceDate = new Date(filters.since);
        filtered = filtered.filter((e) => new Date(e.timestamp) >= sinceDate);
      }
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }
    }

    return filtered;
  }

  /**
   * Get security metrics
   */
  public getMetrics(): SecurityMetrics {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter events from last 24 hours
    const recentEvents = this.events.filter(
      (e) => new Date(e.timestamp) >= last24Hours
    );

    // Calculate metrics
    const threatsByType: Record<string, number> = {};
    const threatsBySeverity: Record<string, number> = {};
    let totalThreats = 0;

    recentEvents.forEach((event) => {
      if (event.type !== "sanitization_block") {
        totalThreats++;
        threatsByType[event.type] = (threatsByType[event.type] || 0) + 1;
        threatsBySeverity[event.severity] =
          (threatsBySeverity[event.severity] || 0) + 1;
      }
    });

    // Get performance data
    const performanceStats = getPerformanceComparison();
    const averageSanitizationTime = performanceStats?.dompurify?.avgTime || 0;

    // Calculate security score (higher is better)
    // Base score on threats blocked vs threats attempted
    let securityScore = 100;

    // Deduct points based on threat frequency and severity
    securityScore -= Math.min(threatsBySeverity.critical || 0 * 20, 80);
    securityScore -= Math.min(threatsBySeverity.high || 0 * 10, 50);
    securityScore -= Math.min(threatsBySeverity.medium || 0 * 5, 25);
    securityScore -= Math.min(threatsBySeverity.low || 0 * 2, 10);

    // Ensure score doesn't go negative
    securityScore = Math.max(securityScore, 0);

    return {
      totalThreatsBlocked: totalThreats,
      threatsByType,
      threatsBySeverity,
      averageSanitizationTime,
      lastThreatDetected:
        recentEvents.length > 0 ? recentEvents[0].timestamp : null,
      securityScore,
    };
  }

  /**
   * Get recent high-severity events
   */
  public getHighSeverityEvents(limit = 10): SecurityEvent[] {
    return this.events
      .filter((e) => e.severity === "high" || e.severity === "critical")
      .slice(0, limit);
  }

  /**
   * Export security report
   */
  public generateReport(): {
    summary: SecurityMetrics;
    recentEvents: SecurityEvent[];
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const recentEvents = this.getEvents({ limit: 50 });

    // Generate recommendations based on metrics
    const recommendations: string[] = [];

    if (metrics.securityScore < 70) {
      recommendations.push(
        "Review security configuration - high threat activity detected"
      );
    }

    if (metrics.averageSanitizationTime > 100) {
      recommendations.push(
        "Consider optimizing sanitization performance - current avg time is high"
      );
    }

    if (metrics.threatsBySeverity.critical > 0) {
      recommendations.push(
        "URGENT: Review critical security threats and implement additional protections"
      );
    }

    if (metrics.totalThreatsBlocked > 100) {
      recommendations.push(
        "High volume of threats detected - consider implementing additional security layers"
      );
    }

    return {
      summary: metrics,
      recentEvents,
      recommendations,
    };
  }

  /**
   * Clear all events (useful for testing)
   */
  public clearEvents(): void {
    this.events = [];
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();

/**
 * Convenience functions for easy integration
 */
export const SecurityLogger = {
  logXSSAttempt: (source: string, details: string, userId?: string) =>
    securityMonitor.recordXSSAttempt(source, details, userId),

  logScriptInjection: (source: string, details: string, userId?: string) =>
    securityMonitor.recordScriptInjection(source, details, userId),

  logSanitization: (
    source: string,
    originalLength: number,
    sanitizedLength: number
  ) =>
    securityMonitor.recordSanitization(source, originalLength, sanitizedLength),

  getMetrics: () => securityMonitor.getMetrics(),

  getEvents: (filters?: Parameters<typeof securityMonitor.getEvents>[0]) =>
    securityMonitor.getEvents(filters),
};

/**
 * Performance monitoring utilities
 */
export const SecurityPerformance = {
  /**
   * Monitor sanitization performance
   */
  monitorSanitization: <T>(operation: () => T, source: string): T => {
    const startTime = performance.now();

    const result = operation();

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Record performance metrics
    if (duration > 100) {
      SecurityLogger.logXSSAttempt(
        source,
        `Slow sanitization detected: ${duration.toFixed(2)}ms`
      );
    }

    return result;
  },

  /**
   * Monitor async sanitization operations
   */
  monitorAsyncSanitization: async <T>(
    operation: () => Promise<T>,
    source: string
  ): Promise<T> => {
    const startTime = performance.now();

    const result = await operation();

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 200) {
      SecurityLogger.logXSSAttempt(
        source,
        `Slow async sanitization detected: ${duration.toFixed(2)}ms`
      );
    }

    return result;
  },
};

export default securityMonitor;

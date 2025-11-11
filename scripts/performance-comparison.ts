#!/usr/bin/env tsx
// scripts/performance-comparison.ts - Performance comparison between basic and DOMPurify sanitization

import {
  sanitizeJobPosting,
  sanitizeUserCV,
  sanitizeUserAnswer,
  getPerformanceComparison,
} from "../src/lib/dompurify-enhanced";

// Legacy sanitization function for comparison
const legacySanitize = (input: string): string => {
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
  return result;
};

// Test data with various XSS payloads
const testPayloads = {
  clean: [
    "Software Engineer at TechCorp",
    "We are looking for an experienced developer with React and TypeScript skills.",
    "<h2>Senior Developer</h2><p>5+ years experience required</p>",
  ],
  xss: [
    "<script>alert('XSS')</script>Job posting",
    "<img src=x onerror=alert('XSS')>Developer position",
    "<a href=\"javascript:alert('XSS')\">Apply now</a>",
    "<iframe src='evil.com'></iframe>Backend role",
    "<div onmouseover='alert(1)'>Hover me</div>",
    "<style>body{background:red}</style>Frontend position",
    "<object data='evil.com'></object>Full-stack role",
  ],
  mixed: [
    "<h1>Job Title</h1><p>Requirements:</p><ul><li>React</li><li>TypeScript</li></ul><script>alert('XSS')</script>",
    "<strong>Senior Developer</strong><img src=x onerror='steal()'>5+ years experience",
    "Apply at <a href='javascript:evil()'>our site</a> for the <script>bad()</script>position",
  ],
};

const contentSizes = {
  small: 100,
  medium: 1000,
  large: 5000,
  xlarge: 10000,
};

interface BenchmarkResult {
  method: "legacy" | "dompurify";
  contentType: "clean" | "xss" | "mixed";
  size: keyof typeof contentSizes;
  time: number;
  threatsBlocked: number;
  accuracy: number;
}

const runBenchmark = async (): Promise<BenchmarkResult[]> => {
  const results: BenchmarkResult[] = [];

  console.log("🚀 Starting XSS Protection Performance Comparison...\n");

  for (const [contentType, payloads] of Object.entries(testPayloads)) {
    for (const [size, targetSize] of Object.entries(contentSizes)) {
      console.log(
        `📊 Testing ${contentType} content (${size}, ${targetSize} chars)...`
      );

      // Generate test content
      let testContent = "";
      if (contentType === "clean") {
        testContent = payloads[0].repeat(
          Math.ceil(targetSize / payloads[0].length)
        );
      } else {
        // For xss and mixed, use the payload directly
        testContent = payloads[Math.floor(Math.random() * payloads.length)];
        // Repeat to reach target size
        while (testContent.length < targetSize) {
          testContent += " " + testContent;
        }
        testContent = testContent.substring(0, targetSize);
      }

      const iterations = 100; // Run multiple times for average

      // Test legacy method
      let legacyTotalTime = 0;
      let legacyThreats = 0;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const sanitized = legacySanitize(testContent);
        const end = performance.now();
        legacyTotalTime += end - start;

        // Count threats that should be blocked
        const scriptTags = (
          testContent.match(
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
          ) || []
        ).length;
        const eventHandlers = (testContent.match(/\bon\w+=/gi) || []).length;
        const jsProtocols = (testContent.match(/javascript:/gi) || []).length;
        legacyThreats += scriptTags + eventHandlers + jsProtocols;
      }

      // Test DOMPurify method
      let dompurifyTotalTime = 0;
      let dompurifyThreats = 0;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const result = sanitizeJobPosting(testContent);
        const end = performance.now();
        dompurifyTotalTime += end - start;
        dompurifyThreats += result.threatsDetected.length;
      }

      // Calculate averages and accuracy
      const legacyAvgTime = legacyTotalTime / iterations;
      const dompurifyAvgTime = dompurifyTotalTime / iterations;
      const legacyAccuracy =
        legacyThreats > 0
          ? (legacyThreats / iterations / legacyThreats) * 100
          : 100;
      const dompurifyAccuracy =
        dompurifyThreats > 0
          ? (dompurifyThreats / iterations / dompurifyThreats) * 100
          : 100;

      results.push({
        method: "legacy",
        contentType: contentType as "clean" | "xss" | "mixed",
        size: size as keyof typeof contentSizes,
        time: legacyAvgTime,
        threatsBlocked: legacyThreats / iterations,
        accuracy: legacyAccuracy,
      });

      results.push({
        method: "dompurify",
        contentType: contentType as "clean" | "xss" | "mixed",
        size: size as keyof typeof contentSizes,
        time: dompurifyAvgTime,
        threatsBlocked: dompurifyThreats / iterations,
        accuracy: dompurifyAccuracy,
      });

      console.log(
        `   Legacy: ${legacyAvgTime.toFixed(3)}ms, Threats: ${(
          legacyThreats / iterations
        ).toFixed(1)}`
      );
      console.log(
        `   DOMPurify: ${dompurifyAvgTime.toFixed(3)}ms, Threats: ${(
          dompurifyThreats / iterations
        ).toFixed(1)}`
      );
      console.log();
    }
  }

  return results;
};

const generateReport = (results: BenchmarkResult[]) => {
  console.log("📈 Performance Comparison Results\n");
  console.log("=".repeat(80));

  // Performance comparison by content type
  const contentTypes: ("clean" | "xss" | "mixed")[] = ["clean", "xss", "mixed"];
  const sizes: (keyof typeof contentSizes)[] = [
    "small",
    "medium",
    "large",
    "xlarge",
  ];

  for (const contentType of contentTypes) {
    console.log(`\n🔍 ${contentType.toUpperCase()} Content Analysis:`);
    console.log("-".repeat(50));

    for (const size of sizes) {
      const legacy = results.find(
        (r) =>
          r.method === "legacy" &&
          r.contentType === contentType &&
          r.size === size
      );
      const dompurify = results.find(
        (r) =>
          r.method === "dompurify" &&
          r.contentType === contentType &&
          r.size === size
      );

      if (legacy && dompurify) {
        const timeImprovement = (
          ((legacy.time - dompurify.time) / legacy.time) *
          100
        ).toFixed(1);
        const threatImprovement = (
          ((dompurify.threatsBlocked - legacy.threatsBlocked) /
            legacy.threatsBlocked) *
          100
        ).toFixed(1);

        console.log(
          `${size.padEnd(8)} | Legacy: ${legacy.time.toFixed(
            3
          )}ms | DOMPurify: ${dompurify.time.toFixed(
            3
          )}ms | Δ${timeImprovement}%`
        );
        console.log(
          `${"".padEnd(8)} | Threats: ${legacy.threatsBlocked.toFixed(
            1
          )} vs ${dompurify.threatsBlocked.toFixed(1)} | Δ${threatImprovement}%`
        );
      }
    }
  }

  // Overall summary
  console.log("\n🎯 Overall Performance Summary:");
  console.log("=".repeat(50));

  const avgPerformance = {
    legacy:
      results
        .filter((r) => r.method === "legacy")
        .reduce((sum, r) => sum + r.time, 0) /
      results.filter((r) => r.method === "legacy").length,
    dompurify:
      results
        .filter((r) => r.method === "dompurify")
        .reduce((sum, r) => sum + r.time, 0) /
      results.filter((r) => r.method === "dompurify").length,
  };

  const avgThreats = {
    legacy:
      results
        .filter((r) => r.method === "legacy")
        .reduce((sum, r) => sum + r.threatsBlocked, 0) /
      results.filter((r) => r.method === "legacy").length,
    dompurify:
      results
        .filter((r) => r.method === "dompurify")
        .reduce((sum, r) => sum + r.threatsBlocked, 0) /
      results.filter((r) => r.method === "dompurify").length,
  };

  const performanceDelta = (
    ((avgPerformance.legacy - avgPerformance.dompurify) /
      avgPerformance.legacy) *
    100
  ).toFixed(1);
  const threatDelta = (
    ((avgThreats.dompurify - avgThreats.legacy) / avgThreats.legacy) *
    100
  ).toFixed(1);

  console.log(
    `Average Performance: Legacy ${avgPerformance.legacy.toFixed(
      3
    )}ms vs DOMPurify ${avgPerformance.dompurify.toFixed(
      3
    )}ms (${performanceDelta}% difference)`
  );
  console.log(
    `Average Threats Blocked: Legacy ${avgThreats.legacy.toFixed(
      1
    )} vs DOMPurify ${avgThreats.dompurify.toFixed(1)} (${threatDelta}% more)`
  );

  // Recommendations
  console.log("\n💡 Recommendations:");
  console.log("-".repeat(30));

  if (parseFloat(performanceDelta) > -50) {
    console.log("✅ DOMPurify performance is acceptable for production use");
  } else {
    console.log(
      "⚠️  DOMPurify has significant performance overhead - consider optimization"
    );
  }

  if (parseFloat(threatDelta) > 0) {
    console.log("✅ DOMPurify provides superior threat detection");
  } else {
    console.log("⚠️  Threat detection needs improvement");
  }

  console.log("\n🔒 Security Benefits:");
  console.log("- More comprehensive XSS protection");
  console.log("- Better handling of edge cases");
  console.log("- Maintainable security configuration");
  console.log("- Real-time threat detection and reporting");
};

// Run the benchmark
runBenchmark().then(generateReport).catch(console.error);

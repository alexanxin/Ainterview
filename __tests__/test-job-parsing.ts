/**
 * Test script to validate the job parsing fix with the problematic URL
 */

import { testJobParsing } from "./app/src/lib/job-parser-test.js";

async function testSpecificJobUrl() {
  const url =
    "https://jobs.solana.com/companies/monkedao-2/jobs/60969275-product-manager-banana-stand-platform";

  console.log(`Testing job parsing for URL: ${url}`);

  try {
    // Fetch the content from the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Ainterview Bot)",
      },
    });

    console.log(`Fetch response status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);

    if (!response.ok) {
      console.log(`Fetch failed with status: ${response.status}`);
      return;
    }

    const htmlContent = await response.text();
    console.log(`HTML content length: ${htmlContent.length}`);

    // Test the parsing
    const result = await testJobParsing(htmlContent);
    console.log("Parsing result:", result);
  } catch (error) {
    console.error("Error testing job URL:", error);
  }
}

// Run the test
testSpecificJobUrl();

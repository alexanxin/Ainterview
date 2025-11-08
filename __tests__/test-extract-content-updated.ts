async function testExtractContent() {
  console.log("Testing updated extract-content API route...");

  // Test with a known working URL
  const workingUrl = "https://boards.greenhouse.io/airbyte/jobs/4718371";
  // Test with a known 404 URL
  const brokenUrl =
    "https://jobs.solana.com/companies/ergonia/jobs/61771462-talent-pool-external#content";

  console.log("\n--- Testing with working URL ---");
  try {
    const response1 = await fetch("http://localhost:3000/api/extract-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: workingUrl }),
    });

    console.log("Response status (working URL):", response1.status);
    const data1 = await response1.json();
    console.log("Response OK (working URL):", response1.ok);
    console.log("Content length (working URL):", data1.text?.length || 0);
  } catch (error) {
    console.error("❌ Error testing working URL:", error);
  }

  console.log("\n--- Testing with broken URL ---");
  try {
    const response2 = await fetch("http://localhost:3000/api/extract-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: brokenUrl }),
    });

    console.log("Response status (broken URL):", response2.status);
    const data2 = await response2.json();
    console.log("Response OK (broken URL):", response2.ok);
    console.log("Error message (broken URL):", data2.error);
  } catch (error) {
    console.error("❌ Error testing broken URL:", error);
  }
}

testExtractContent();

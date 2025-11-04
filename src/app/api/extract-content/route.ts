import { NextRequest } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    console.log("Extract content request for URL:", url);

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    // Create a controller to manage the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

    // Fetch the content from the URL
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Ainterview Bot)",
      },
    });

    clearTimeout(timeoutId);

    console.log("Fetch response status:", response.status);
    console.log("Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      console.log("Fetch failed with status:", response.status);
      return Response.json(
        { error: "Failed to fetch content from URL" },
        { status: response.status }
      );
    }

    // Get the content type
    const contentType = response.headers.get("content-type");

    if (
      !contentType ||
      (!contentType.includes("text/") && !contentType.includes("html"))
    ) {
      return Response.json(
        { error: "URL does not contain text or HTML content" },
        { status: 400 }
      );
    }

    // Read the response body as text
    const htmlContent = await response.text();

    console.log("HTML content length:", htmlContent.length);

    // Limit content size to prevent server overload
    if (htmlContent.length > 200000) {
      // Increased limit to 200KB
      console.log("Content too large, rejecting");
      return Response.json(
        { error: "Content too large to process (max 200KB)" },
        { status: 400 }
      );
    }

    // Add a small delay to simulate processing time and show progress
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Load HTML into Cheerio for better parsing
    const $ = cheerio.load(htmlContent);

    console.log("Loaded HTML into Cheerio");

    // Remove unwanted elements
    $(
      "script, style, nav, header, footer, aside, menu, link, meta, noscript"
    ).remove();

    console.log("Removed unwanted elements");

    // Look for common job posting sections and extract relevant content
    const jobPostingPhrases = [
      "job description",
      "job title",
      "position",
      "responsibilities",
      "requirements",
      "qualifications",
      "about the role",
      "role and responsibilities",
      "what you'll do",
      "about the company",
      "company details",
      "salary",
      "compensation",
      "benefits",
      "location",
      "employment type",
      "work type",
      "remote",
      "hybrid",
      "on-site",
      "experience required",
      "education",
      "skills",
      "technologies",
    ];

    // Priority selectors for job content
    const prioritySelectors = [
      "main",
      "article",
      '[class*="job"]',
      '[id*="job"]',
      '[class*="description"]',
      '[id*="description"]',
      '[class*="posting"]',
      '[id*="posting"]',
      '[class*="position"]',
      '[id*="position"]',
      '[class*="vacancy"]',
      '[id*="vacancy"]',
      '[class*="role"]',
      '[id*="role"]',
      '[class*="opportunity"]',
      '[id*="opportunity"]',
      '[class*="sc-"][class*="dYjqnN"]', // Specific selector for job description content container
      '[class*="sc-aXZVg"][class*="dYjqnN"]', // More specific selector for job content
      '[class*="sc-"][class*="iIGtVd"]', // Another specific selector for job application form area that often contains job details
      '[class*="sc-aXZVg"][class*="iIGtVd"]', // More specific version
      '[class*="sc-"][class*="dKubqp"]', // Another common container
      '[class*="sc-aXZVg"][class*="dKubqp"]', // More specific version
      '[data-testid="job-posting"]',
      ".job-posting",
      ".posting-content",
      ".job-description",
      ".job-post",
      ".job-details",
      '[class*="descriptionContainer"]',
      '[class*="jobContent"]',
      '[class*="posting-content"]',
      '[class*="jobDescription"]',
      '[class*="jobDetails"]',
      '[class*="jobBody"]',
      '[class*="jobText"]',
      '[class*="jd-content"]',
      '[class*="job-posting-content"]',
      '[class*="job-posting-body"]',
      '[class*="job-posting-description"]',
      '[class*="job-posting-text"]',
      '[class*="job-posting-details"]',
      '[class*="job-posting-body-text"]',
      '[class*="job-posting-description-text"]',
      '[class*="job-posting-details-text"]',
      '[class*="job-posting-body-content"]',
      '[class*="job-posting-description-content"]',
      '[class*="job-posting-details-content"]',
      '[class*="job-posting-body-text-content"]',
      '[class*="job-posting-description-text-content"]',
      '[class*="job-posting-details-text-content"]',
      '[class*="job-posting-body-text-content-wrapper"]',
      '[class*="job-posting-description-text-content-wrapper"]',
      '[class*="job-posting-details-text-content-wrapper"]',
      '[class*="job-posting-body-text-content-container"]',
      '[class*="job-posting-description-text-content-container"]',
      '[class*="job-posting-details-text-content-container"]',
      '[class*="job-posting-body-text-content-area"]',
      '[class*="job-posting-description-text-content-area"]',
      '[class*="job-posting-details-text-content-area"]',
      '[class*="job-posting-body-text-content-section"]',
      '[class*="job-posting-description-text-content-section"]',
      '[class*="job-posting-details-text-content-section"]',
      '[class*="job-posting-body-text-content-block"]',
      '[class*="job-posting-description-text-content-block"]',
      '[class*="job-posting-details-text-content-block"]',
      '[class*="job-posting-body-text-content-item"]',
      '[class*="job-posting-description-text-content-item"]',
      '[class*="job-posting-details-text-content-item"]',
      '[class*="job-posting-body-text-content-element"]',
      '[class*="job-posting-description-text-content-element"]',
      '[class*="job-posting-details-text-content-element"]',
      '[class*="job-posting-body-text-content-part"]',
      '[class*="job-posting-description-text-content-part"]',
      '[class*="job-posting-details-text-content-part"]',
      '[class*="job-posting-body-text-content-piece"]',
      '[class*="job-posting-description-text-content-piece"]',
      '[class*="job-posting-details-text-content-piece"]',
      '[class*="job-posting-body-text-content-section-wrapper"]',
      '[class*="job-posting-description-text-content-section-wrapper"]',
      '[class*="job-posting-details-text-content-section-wrapper"]',
      '[class*="job-posting-body-text-content-section-container"]',
      '[class*="job-posting-description-text-content-section-container"]',
      '[class*="job-posting-details-text-content-section-container"]',
      '[class*="job-posting-body-text-content-section-area"]',
      '[class*="job-posting-description-text-content-section-area"]',
      '[class*="job-posting-details-text-content-section-area"]',
      '[class*="job-posting-body-text-content-section-block"]',
      '[class*="job-posting-description-text-content-section-block"]',
      '[class*="job-posting-details-text-content-section-block"]',
      '[class*="job-posting-body-text-content-section-item"]',
      '[class*="job-posting-description-text-content-section-item"]',
      '[class*="job-posting-details-text-content-section-item"]',
      '[class*="job-posting-body-text-content-section-element"]',
      '[class*="job-posting-description-text-content-section-element"]',
      '[class*="job-posting-details-text-content-section-element"]',
      '[class*="job-posting-body-text-content-section-part"]',
      '[class*="job-posting-description-text-content-section-part"]',
      '[class*="job-posting-details-text-content-section-part"]',
      '[class*="job-posting-body-text-content-section-piece"]',
      '[class*="job-posting-description-text-content-section-piece"]',
      '[class*="job-posting-details-text-content-section-piece"]',
      ':not(footer):not(nav):not(header):not([class*="footer"]):not([class*="nav"]):not([class*="header"]):not([class*="menu"])', // Exclude common non-content elements
    ];

    let mainContent = "";
    let foundContent = false;

    // Try priority selectors first
    for (const selector of prioritySelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        mainContent = element.text().trim();
        console.log(
          `Found content with selector "${selector}", length: ${mainContent.length}`
        );
        if (mainContent.length > 200) {
          // Ensure substantial content
          foundContent = true;
          console.log("Using priority selector content");
          break;
        }
      }
    }

    // If the content looks like footer or navigation, try more specific selectors
    if (
      foundContent &&
      (mainContent.toLowerCase().includes("footer") ||
        mainContent.toLowerCase().includes("copyright") ||
        mainContent.toLowerCase().includes("solana foundation") ||
        mainContent.toLowerCase().includes("privacy policy"))
    ) {
      console.log(
        "Detected footer or navigation content, trying more specific selectors"
      );
      foundContent = false;
      mainContent = "";
    }

    // If no priority content found, try to find the largest text block
    if (!foundContent) {
      console.log("No priority content found, trying fallback");
      let maxLength = 0;
      let bestContent = "";

      // More comprehensive search for content containers
      $("div, section, article, main").each((_, element) => {
        const $element = $(element);
        const text = $element.text().trim();

        // Check if this element contains job-related keywords
        const hasJobKeywords = jobPostingPhrases.some((phrase) =>
          text.toLowerCase().includes(phrase)
        );

        // Prioritize elements that contain job keywords or have larger content
        const score = hasJobKeywords ? text.length * 2 : text.length;

        if (score > maxLength && text.length > 200) {
          maxLength = score;
          bestContent = text;
        }
      });

      if (bestContent) {
        mainContent = bestContent;
        foundContent = true;
        console.log("Using fallback content, length:", bestContent.length);
      } else {
        console.log("No suitable fallback content found");
      }
    }

    // Additional fallback: look for script tags that might contain job data
    if (!foundContent) {
      console.log("Trying to extract content from script tags");
      $('script[type="application/json"], script#__NEXT_DATA__').each(
        (_, element) => {
          const scriptContent = $(element).html();
          if (scriptContent && scriptContent.includes("description")) {
            try {
              // Try to parse as JSON and extract description
              const data = JSON.parse(scriptContent);
              const description = extractDescriptionFromJson(data);
              if (description && description.length > 200) {
                mainContent = description;
                foundContent = true;
                console.log("Found content in JSON script tag");
                return false; // break out of loop
              }
            } catch (e) {
              // If not valid JSON, check if it contains job content as text
              if (
                scriptContent.length > 200 &&
                jobPostingPhrases.some((phrase) =>
                  scriptContent.toLowerCase().includes(phrase)
                )
              ) {
                mainContent = scriptContent;
                foundContent = true;
                console.log("Found job content in script tag");
                return false; // break out of loop
              }
            }
          }
        }
      );
    }

    // Fallback to body content
    if (!foundContent) {
      mainContent = $("body").text().trim();
      console.log(
        "Using body content as last resort, length:",
        mainContent.length
      );
    }

    // Extract text from the main content, preserving paragraph structure somewhat
    const textContent = mainContent
      .replace(/<[^>]*>/g, " ") // Remove all HTML tags
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/&amp;/g, "&") // Replace &amp;
      .replace(/&lt;/g, "<") // Replace &lt;
      .replace(/&gt;/g, ">") // Replace &gt;
      .replace(/&quot;/g, '"') // Replace &quot;
      .replace(/\s*\n\s*/g, "\n") // Normalize line breaks
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Replace triple line breaks with double
      .replace(/\s\s+/g, " ") // Replace multiple whitespaces with single space
      .trim();

    // Check if the content contains job posting phrases to validate it's a job posting
    const hasJobPhrases = jobPostingPhrases.some((phrase) =>
      textContent.toLowerCase().includes(phrase)
    );

    console.log("Final text content length:", textContent.length);
    console.log("Has job phrases:", hasJobPhrases);
    console.log(
      "First 200 chars of final content:",
      textContent.substring(0, 200)
    );

    if (textContent.length > 100 && hasJobPhrases) {
      console.log("Returning content with job phrases");
      return Response.json({
        text: textContent,
        length: textContent.length,
      });
    } else if (textContent.length > 200) {
      // If content is substantial but doesn't have clear job phrases, still return it
      console.log(
        "Returning content without job phrases but substantial length"
      );
      return Response.json({
        text: textContent,
        length: textContent.length,
      });
    } else {
      console.log("Rejecting content - too short or no job phrases");
      return Response.json(
        {
          error:
            "Could not extract meaningful job posting content from the provided URL",
        },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return Response.json(
        { error: "Request timed out while fetching content" },
        { status: 408 }
      );
    }

    console.error("Error extracting content from URL:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "Error extracting content from URL: " + errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to extract job description from JSON data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDescriptionFromJson(data: any): string | null {
  if (!data) return null;

  try {
    // Look for description in common JSON structures
    if (data.props?.pageProps?.job?.description) {
      return data.props.pageProps.job.description;
    }

    if (data.props?.pageProps?.initialState?.jobs?.currentJob?.description) {
      return data.props.pageProps.initialState.jobs.currentJob.description;
    }

    if (data.props?.pageProps?.network?.jobs?.found) {
      // If jobs is an array, look for the first job with a description
      const jobsArray = data.props.pageProps.network.jobs.found;
      if (Array.isArray(jobsArray)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const job = jobsArray.find((j: any) => j.description);
        if (job) {
          return job.description;
        }
      }
    }

    // Look for description field in the JSON at any level
    return findDescriptionInObject(data);
  } catch (e) {
    // If there's an error in accessing properties, return null
    return null;
  }
}

// Helper function to recursively find a description field in an object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findDescriptionInObject(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;

  for (const key in obj) {
    if (key.toLowerCase().includes("description")) {
      if (typeof obj[key] === "string" && obj[key].length > 0) {
        return obj[key];
      }
    }

    if (typeof obj[key] === "object") {
      const result = findDescriptionInObject(obj[key]);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Test function to validate the job parsing functionality
 * This helps debug why certain job URLs might return 400 errors
 */

import * as cheerio from "cheerio";

// Test the selectors that were added to the extract-content route
export async function testJobParsing(htmlContent: string): Promise<{
  success: boolean;
  message: string;
  contentLength?: number;
  hasJobPhrases?: boolean;
}> {
  console.log("Testing job parsing with provided HTML content");

  // Remove unwanted elements
  const $ = cheerio.load(htmlContent);
  $(
    "script, style, nav, header, footer, aside, menu, link, meta, noscript"
  ).remove();

  // Priority selectors for job content (same as in the API route)
  const prioritySelectors = [
    "main",
    "article",
    '[class*="job"]',
    '[id*="job"]',
    '[class*="description"]',
    '[id*="description"]',
    '[class*="content"]',
    '[id*="content"]',
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

  // If no priority content found, try to find the largest text block
  if (!foundContent) {
    console.log("No priority content found, trying fallback");
    let maxLength = 0;
    let bestContent = "";

    // More comprehensive search for content containers
    $("div, section, article, main").each((_, element) => {
      const $element = $(element);
      const text = $element.text().trim();

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
    .replace(/&/g, "&") // Replace &
    .replace(/</g, "<") // Replace <
    .replace(/>/g, ">") // Replace >
    .replace(/"/g, '"') // Replace "
    .replace(/\s*\n\s*/g, "\n") // Normalize line breaks
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Replace triple line breaks with double
    .replace(/\s\s+/g, " ") // Replace multiple whitespaces with single space
    .trim();

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
    console.log(
      "Content would be accepted - has job phrases and sufficient length"
    );
    return {
      success: true,
      message: "Content successfully extracted with job phrases",
      contentLength: textContent.length,
      hasJobPhrases: hasJobPhrases,
    };
  } else if (textContent.length > 200) {
    // If content is substantial but doesn't have clear job phrases, still return it
    console.log(
      "Content would be accepted - substantial length but no clear job phrases"
    );
    return {
      success: true,
      message: "Content successfully extracted with sufficient length",
      contentLength: textContent.length,
      hasJobPhrases: hasJobPhrases,
    };
  } else {
    console.log("Content would be rejected - too short or no job phrases");
    return {
      success: false,
      message:
        "Could not extract meaningful job posting content from the provided HTML",
      contentLength: textContent.length,
      hasJobPhrases: hasJobPhrases,
    };
  }
}

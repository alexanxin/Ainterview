// pdf-parser.ts - Utility for parsing PDF files
import pdfjsLib from "./pdf-worker";

export const parsePdfText = async (file: File): Promise<string> => {
  try {
    // Create a new FileReader to read the PDF file
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Get the number of pages
    const numPages = pdf.numPages;
    let fullText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Extract text content from the page
      const textContent = await page.getTextContent();

      // Join all text items from this page
      const pageText = textContent.items
        .map((item) => (item as { str: string }).str)
        .join(" ");

      // Add page text to full text with page separator
      fullText += pageText + " ";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
};

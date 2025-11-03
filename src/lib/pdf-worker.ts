// pdf-worker.ts - Properly configured PDF worker for Next.js
import * as pdfjsLib from "pdfjs-dist";

// Set up the worker for PDF.js - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export default pdfjsLib;

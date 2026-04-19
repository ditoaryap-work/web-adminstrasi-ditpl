/**
 * Utility to sanitize strings for safe filenames in Google Drive
 * Replaces illegal characters and limits length to keep names readable.
 */
export function sanitizeFilename(text: string | null | undefined, maxLength: number = 40): string {
  if (!text) return "";
  
  return text
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "_") // Replace illegal characters with underscore
    .replace(/\s+/g, "_")           // Replace spaces with underscores
    .substring(0, maxLength)        // Limit length
    .replace(/_{2,}/g, "_")         // Replace double underscores with single
    .replace(/^_|_$/g, "");         // Remove leading/trailing underscores
}

/**
 * Format date for filename (YYYY-MM-DD)
 */
export function formatFilenameDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "no-date";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "invalid-date";
  
  return d.toISOString().split("T")[0];
}

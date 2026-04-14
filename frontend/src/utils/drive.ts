/**
 * Utility for handling Google Drive file URLs
 */

/**
 * Converts a Google Drive viewer URL to a direct download URL.
 * Supports format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * to: https://drive.google.com/uc?export=download&id=FILE_ID
 */
export function getDriveDownloadUrl(url: string): string {
  if (!url) return '';
  
  // Format 1: drive.google.com/file/d/ID/view
  const matchId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://drive.google.com/uc?export=download&id=${matchId[1]}`;
  }
  
  // Format 2: drive.google.com/open?id=ID
  const matchOpen = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (url.includes('open?') && matchOpen && matchOpen[1]) {
    return `https://drive.google.com/uc?export=download&id=${matchOpen[1]}`;
  }

  // Already a download link or unknown format
  return url;
}

/**
 * Triggers a file download in the browser
 */
export function triggerDownload(url: string, filename?: string) {
  const downloadUrl = getDriveDownloadUrl(url);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename || 'dokumen');
  link.setAttribute('target', '_blank'); // Fallback for Drive links that the browser might block
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Filename Encoding Utilities
 * 
 * Handles proper encoding of filenames with non-ASCII characters
 * for HTTP Content-Disposition headers (RFC 5987)
 */

/**
 * Encode filename for Content-Disposition header
 * Supports international characters (Vietnamese, Czech, Chinese, etc.)
 * 
 * @param filename - Original filename with potentially non-ASCII characters
 * @returns Properly formatted Content-Disposition value
 * 
 * @example
 * encodeContentDisposition("bắt cóc.srt")
 * // Returns: 'attachment; filename="bat_coc.srt"; filename*=UTF-8''b%E1%BA%AFt%20c%C3%B3c.srt'
 */
export function encodeContentDisposition(filename: string): string {
  // Encode filename using RFC 5987 (UTF-8 encoding)
  const encodedFileName = encodeURIComponent(filename)
  
  // Create ASCII-safe fallback by replacing non-ASCII chars with underscore
  const asciiFallback = filename.replace(/[^\x00-\x7F]/g, '_')
  
  // Return both formats for maximum browser compatibility:
  // - filename="..." for older browsers (ASCII-safe fallback)
  // - filename*=UTF-8''... for modern browsers (RFC 5987)
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedFileName}`
}

/**
 * Sanitize filename to be safe for filesystems
 * Removes or replaces characters that might cause issues
 * 
 * @param filename - Original filename
 * @returns Sanitized filename safe for most filesystems
 */
export function sanitizeFilename(filename: string): string {
  return filename
    // Remove or replace dangerous characters
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    // Remove leading/trailing dots and spaces
    .replace(/^[.\s]+|[.\s]+$/g, '')
    // Limit length to 255 characters (common filesystem limit)
    .slice(0, 255)
}

/**
 * Check if filename contains non-ASCII characters
 * 
 * @param filename - Filename to check
 * @returns true if filename contains non-ASCII characters
 */
export function hasNonASCII(filename: string): boolean {
  return /[^\x00-\x7F]/.test(filename)
}

/**
 * Get safe filename for download
 * Preserves original characters but ensures it's safe
 * 
 * @param filename - Original filename
 * @returns Safe filename for download
 */
export function getSafeDownloadFilename(filename: string): string {
  // First sanitize for filesystem safety
  let safe = sanitizeFilename(filename)
  
  // If empty after sanitization, use default
  if (!safe) {
    safe = 'download.srt'
  }
  
  return safe
}


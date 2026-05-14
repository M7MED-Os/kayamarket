/**
 * 🔒 Security Utility: HTML Sanitizer
 * Prevents XSS (Cross-Site Scripting) attacks by escaping HTML tags and attributes
 * from user inputs before saving them to the database.
 */

export function sanitizeHtml(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'string') return String(input);
  
  // Prevent script injection by escaping < and >
  // Note: We don't escape &, ", or ' because React safely handles them, 
  // and escaping them causes them to display literally as &amp; in the UI.
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 🔒 Deep sanitize for objects and arrays
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeHtml(obj) as unknown as T;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }
  
  return obj;
}

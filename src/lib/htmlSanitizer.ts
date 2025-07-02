import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

// Configuration for DOMPurify - allows common formatting elements while blocking dangerous ones
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
  'a', 'span', 'div', 'hr', 'sup', 'sub', 'mark', 'del', 'ins'
];

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target', 'rel'],
  'span': ['class'],
  'div': ['class'],
  'code': ['class'],
  'pre': ['class']
};

const ALLOWED_URI_REGEXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving formatting
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration overrides
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string, options?: any): string {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback - just strip all HTML tags
    return html.replace(/<[^>]*>/g, '');
  }

  const defaultConfig = {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.keys(ALLOWED_ATTRIBUTES).reduce((acc, tag) => {
      return acc.concat(ALLOWED_ATTRIBUTES[tag as keyof typeof ALLOWED_ATTRIBUTES]);
    }, [] as string[]),
    ALLOWED_URI_REGEXP,
    // Remove any script-like content
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
    // Keep relative URLs safe
    ALLOW_DATA_ATTR: false,
    // Remove unknown protocols
    ALLOW_UNKNOWN_PROTOCOLS: false,
  };

  const config = { ...defaultConfig, ...options };
  
  return DOMPurify.sanitize(html, config) as unknown as string;
}

/**
 * Sanitizes and parses HTML content into React elements
 * @param html - The HTML string to sanitize and parse
 * @param sanitizeOptions - Optional DOMPurify configuration overrides
 * @returns React elements or string
 */
export function safeParseHtml(html: string, sanitizeOptions?: DOMPurify.Config) {
  const sanitizedHtml = sanitizeHtml(html, sanitizeOptions);
  return parse(sanitizedHtml);
}

/**
 * More restrictive sanitization for user-generated content
 * Only allows basic formatting tags
 */
export function sanitizeUserContent(html: string): string {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    FORBID_ATTR: ['style', 'class', 'id']
  });
}

/**
 * Very restrictive sanitization - strips all HTML
 * Use for sensitive contexts like titles, names, etc.
 */
export function stripAllHtml(html: string): string {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

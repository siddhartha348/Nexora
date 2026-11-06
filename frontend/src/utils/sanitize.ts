import DOMPurify from 'dompurify';

/**
 * Enterprise XSS Defense — Sanitizes user-supplied text or rich content
 * before DOM rendering. Prevents script injection, event handlers, and data URI exploits.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'span', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'title'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'svg'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'javascript:'],
  });
}

/**
 * Escapes plain text to prevent HTML injection in contexts where rich text is disallowed.
 */
export function escapeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


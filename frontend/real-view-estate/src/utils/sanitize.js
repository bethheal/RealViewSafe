// Simple input sanitization helper for the frontend
// Prevent XSS by escaping HTML entities

export function sanitizeInput(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Sanitize user-generated content (descriptions, messages)
export function sanitizeHtml(html) {
  // Remove script tags and event handlers
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .trim();
}

// Validate email
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone (basic)
export function isValidPhone(phone) {
  const re = /^[\d\s\-\+\(\)]{10,}$/;
  return re.test(phone || "");
}

// Trim and validate non-empty
export function isNonEmptyString(str) {
  return typeof str === "string" && str.trim().length > 0;
}

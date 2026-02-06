// Backend input validation and sanitization helpers

export function sanitizeString(str) {
  if (!str) return "";
  return String(str).trim();
}

// Remove dangerous characters from strings
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .substring(0, 255);
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

// Validate URL
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate positive number
export function isPositiveNumber(n) {
  const num = Number(n);
  return Number.isFinite(num) && num > 0;
}

// Validate enum value
export function isValidEnum(value, enumValues) {
  return enumValues.includes(value);
}

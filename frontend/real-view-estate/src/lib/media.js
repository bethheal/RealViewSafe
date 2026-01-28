const rawBase = import.meta.env.VITE_API_URL || "";

const base = rawBase
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export function resolveMediaUrl(url) {
  if (!url) return "";

  // Already absolute
  if (/^https?:\/\//i.test(url)) return url;

  // Normalize relative uploads path
  const normalized = url.startsWith("/") ? url : `/${url}`;

  return base ? `${base}${normalized}` : normalized;
}

export function formatGhs(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "GHS 0";
  return `GHS ${num.toLocaleString()}`;
}

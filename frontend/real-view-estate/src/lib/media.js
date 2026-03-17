const rawApi =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

const apiBase = rawApi
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const rawMedia = import.meta.env.VITE_MEDIA_URL || "";
const mediaBase = rawMedia ? rawMedia.replace(/\/+$/, "") : apiBase;

export function resolveMediaUrl(url) {
  if (!url) return "";

  // Already absolute
  if (/^https?:\/\//i.test(url)) return url;

  // Normalize relative uploads path
  const normalized = url.startsWith("/") ? url : `/${url}`;

  if (normalized.startsWith("/uploads/")) {
    const mapped = normalized.replace(/^\/uploads\//, "/api/uploads/");
    return mediaBase ? `${mediaBase}${mapped}` : mapped;
  }

  return mediaBase ? `${mediaBase}${normalized}` : normalized;
}

export function isVideoUrl(url) {
  if (!url) return false;
  const cleanUrl = String(url).split("?")[0];
  return /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(cleanUrl);
}

export function extractMediaUrls(property) {
  const media = Array.isArray(property?.images) ? property.images : [];
  return media
    .map((item) => {
      const raw = typeof item === "string" ? item : item?.url;
      return resolveMediaUrl(raw);
    })
    .filter(Boolean);
}

export function extractImageUrls(property) {
  return extractMediaUrls(property).filter((url) => !isVideoUrl(url));
}

export function extractVideoUrls(property) {
  return extractMediaUrls(property).filter((url) => isVideoUrl(url));
}

export function pickPrimaryImageUrl(property, fallback = "") {
  const images = extractImageUrls(property);
  if (images[0]) return images[0];

  const rawFallback = resolveMediaUrl(property?.image);
  if (rawFallback && !isVideoUrl(rawFallback)) return rawFallback;

  return fallback;
}

export function formatGhs(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "GHS 0";
  return `GHS ${num.toLocaleString()}`;
}

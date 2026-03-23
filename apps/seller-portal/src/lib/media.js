export function getApiBase() {
  return import.meta.env.VITE_API_URL || "https://api.rahba.site";
}

export function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const API_BASE = getApiBase().replace(/\/$/, "");

  if (url.startsWith("/media/")) return `${API_BASE}${url}`;
  if (url.startsWith("media/")) return `${API_BASE}/${url}`;
  if (url.startsWith("products/")) {
    return `${API_BASE}/media/${url.slice("products/".length)}`;
  }

  return url;
}

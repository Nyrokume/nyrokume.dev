/** Cloudflare Worker — API on GitHub Pages (no trailing slash). */
export const PRODUCTION_API_BASE = "https://nyrokume-chat-api.nyrokume.workers.dev";

/** API base URL — local empty (relative), production uses Cloudflare Worker. */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  if (process.env.GITHUB_PAGES === "true") {
    return PRODUCTION_API_BASE;
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "nyrokume.github.io" || hostname === "nyrokume.dev") {
      return PRODUCTION_API_BASE;
    }
  }

  return "";
}

export function getChatApiUrl(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/chat` : "/api/chat";
}

export function getInquiryApiUrl(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/inquiry` : "/api/inquiry";
}

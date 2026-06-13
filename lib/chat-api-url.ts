/** Cloudflare Worker — chat API on GitHub Pages (no trailing slash). */
export const PRODUCTION_CHAT_API_BASE =
  "https://nyrokume-chat-api.nyrokume.workers.dev";

/** Chat API URL — local `/api/chat`, production uses Cloudflare Worker. */
export function getChatApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return `${fromEnv}/api/chat`;
  }

  if (process.env.GITHUB_PAGES === "true") {
    return `${PRODUCTION_CHAT_API_BASE}/api/chat`;
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "nyrokume.github.io" || hostname === "nyrokume.dev") {
      return `${PRODUCTION_CHAT_API_BASE}/api/chat`;
    }
  }

  return "/api/chat";
}

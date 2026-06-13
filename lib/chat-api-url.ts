/** Chat API base — local `/api/chat`, production uses external worker URL. */
export function getChatApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, "");
  return base ? `${base}/api/chat` : "/api/chat";
}

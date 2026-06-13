export const ALLOWED_CHAT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
] as const;

export type AllowedChatModel = (typeof ALLOWED_CHAT_MODELS)[number];

export const DEFAULT_CHAT_MODEL: AllowedChatModel = "gemini-2.5-flash";

export function isAllowedChatModel(value: string): value is AllowedChatModel {
  return (ALLOWED_CHAT_MODELS as readonly string[]).includes(value);
}

export function resolveChatModel(
  requested: string | undefined,
  fallback: string,
): AllowedChatModel {
  if (requested && isAllowedChatModel(requested)) {
    return requested;
  }

  if (isAllowedChatModel(fallback)) {
    return fallback;
  }

  return DEFAULT_CHAT_MODEL;
}

export function mapChatError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("No chat providers configured")) {
    return "Chat is not configured. Add at least one API key in .env.local.";
  }

  if (message.includes("GEMINI_API_KEY is not configured") && !message.includes("|")) {
    return "Chat is not configured";
  }

  if (message.includes("[404") || message.includes("not found")) {
    return "Model unavailable. Try another model from the list.";
  }

  if (message.includes("[429") || message.includes("quota") || message.includes("Too Many Requests")) {
    return "Rate limit reached. Wait a minute or switch to another free model.";
  }

  if (message.includes("[403") || message.includes("API key not valid") || message.includes("Unauthorized")) {
    return "Invalid API key. Check keys in .env.local.";
  }

  if (message.includes("shut down") || message.includes("deprecated")) {
    return "This model was retired. Switch to 2.5 Flash or 3.x Flash.";
  }

  if (message.includes("First content should be with role 'user'")) {
    return "Chat history error. Refresh the page and try again.";
  }

  if (message.includes("openrouter:") || message.includes("groq:")) {
    return "Primary AI is unavailable. Fallback provider failed too — try again later.";
  }

  return "Failed to generate response";
}

/** @deprecated Use mapChatError */
export const mapGeminiError = mapChatError;

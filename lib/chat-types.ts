export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequestBody = {
  messages: ChatMessage[];
  locale?: "ru" | "en";
  provider?: "gemini" | "groq" | "openrouter";
  model?: string;
};

export type ChatResponseBody = {
  message: ChatMessage;
};

export type ChatErrorBody = {
  error: string;
};

import type { ChatMessage } from "@/lib/chat-types";
import type { Locale } from "@/lib/types";

export type ChatProviderId = "gemini" | "groq" | "openrouter";

export type ChatProviderContext = {
  messages: ChatMessage[];
  locale: Locale;
  model: string;
  systemPrompt: string;
};

export type ChatProvider = {
  id: ChatProviderId;
  isConfigured: () => boolean;
  generate: (context: ChatProviderContext) => Promise<string>;
};

export type ChatGenerateResult = {
  content: string;
  provider: ChatProviderId;
  model: string;
};

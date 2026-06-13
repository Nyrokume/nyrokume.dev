import { geminiProvider } from "@/lib/chat-providers/gemini";
import { groqProvider, openRouterProvider } from "@/lib/chat-providers/openai-compatible";
import type { ChatProvider, ChatProviderId } from "@/lib/chat-providers/types";

const PROVIDERS: Record<ChatProviderId, ChatProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
  openrouter: openRouterProvider,
};

const DEFAULT_ORDER: ChatProviderId[] = ["gemini", "groq", "openrouter"];

function parseProviderOrder(): ChatProviderId[] {
  const raw = process.env.CHAT_PROVIDER_ORDER;
  if (!raw) {
    return DEFAULT_ORDER;
  }

  const parsed = raw
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is ChatProviderId => item in PROVIDERS);

  return parsed.length > 0 ? parsed : DEFAULT_ORDER;
}

export function getConfiguredProviders(): ChatProvider[] {
  return parseProviderOrder()
    .map((id) => PROVIDERS[id])
    .filter((provider) => provider.isConfigured());
}

export function getProviderModel(providerId: ChatProviderId, requestedGeminiModel: string): string {
  switch (providerId) {
    case "gemini":
      return requestedGeminiModel;
    case "groq":
      return process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    case "openrouter":
      return process.env.OPENROUTER_MODEL ?? "openrouter/free";
    default:
      return requestedGeminiModel;
  }
}

export { PROVIDERS };

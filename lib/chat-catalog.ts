import type { ChatProviderId } from "@/lib/chat-providers/types";
import type { ChatProviderOption, Locale } from "@/lib/types";

export type CatalogModelDef = {
  id: string;
  /** Lower = cheaper / lighter. Default model uses the lowest rank. */
  costRank: number;
  label: { ru: string; en: string };
};

export type CatalogProviderDef = {
  id: ChatProviderId;
  label: string;
  models: CatalogModelDef[];
};

/**
 * Chat-capable models per provider.
 * Groq list: https://console.groq.com/docs/models
 * OpenRouter free: https://openrouter.ai/models (pricing.prompt = 0)
 * Gemini: https://ai.google.dev/gemini-api/docs/models
 */
export const CHAT_PROVIDER_DEFS: CatalogProviderDef[] = [
  {
    id: "gemini",
    label: "gemini",
    models: [
      {
        id: "gemini-2.5-flash-lite",
        costRank: 1,
        label: { ru: "2.5 flash-lite", en: "2.5 flash-lite" },
      },
      {
        id: "gemini-3.1-flash-lite",
        costRank: 2,
        label: { ru: "3.1 flash-lite", en: "3.1 flash-lite" },
      },
      {
        id: "gemini-2.5-flash",
        costRank: 3,
        label: { ru: "2.5 flash", en: "2.5 flash" },
      },
      {
        id: "gemini-3-flash-preview",
        costRank: 4,
        label: { ru: "3 flash preview", en: "3 flash preview" },
      },
      {
        id: "gemini-3.5-flash",
        costRank: 5,
        label: { ru: "3.5 flash", en: "3.5 flash" },
      },
    ],
  },
  {
    id: "groq",
    label: "groq",
    models: [
      {
        id: "llama-3.1-8b-instant",
        costRank: 1,
        label: { ru: "llama 3.1 8b", en: "llama 3.1 8b" },
      },
      {
        id: "llama-3.2-1b-preview",
        costRank: 2,
        label: { ru: "llama 3.2 1b", en: "llama 3.2 1b" },
      },
      {
        id: "llama-3.2-3b-preview",
        costRank: 3,
        label: { ru: "llama 3.2 3b", en: "llama 3.2 3b" },
      },
      {
        id: "gemma2-9b-it",
        costRank: 4,
        label: { ru: "gemma2 9b", en: "gemma2 9b" },
      },
      {
        id: "gemma-7b-it",
        costRank: 5,
        label: { ru: "gemma 7b", en: "gemma 7b" },
      },
      {
        id: "mixtral-8x7b-32768",
        costRank: 6,
        label: { ru: "mixtral 8x7b", en: "mixtral 8x7b" },
      },
      {
        id: "meta-llama/llama-4-scout-17b-16e-instruct",
        costRank: 7,
        label: { ru: "llama 4 scout", en: "llama 4 scout" },
      },
      {
        id: "llama-3.1-70b-versatile",
        costRank: 8,
        label: { ru: "llama 3.1 70b", en: "llama 3.1 70b" },
      },
      {
        id: "llama-3.3-70b-versatile",
        costRank: 9,
        label: { ru: "llama 3.3 70b", en: "llama 3.3 70b" },
      },
    ],
  },
  {
    id: "openrouter",
    label: "openrouter",
    models: [
      {
        id: "liquid/lfm-2.5-1.2b-instruct:free",
        costRank: 1,
        label: { ru: "lfm 1.2b free", en: "lfm 1.2b free" },
      },
      {
        id: "meta-llama/llama-3.2-3b-instruct:free",
        costRank: 2,
        label: { ru: "llama 3.2 3b free", en: "llama 3.2 3b free" },
      },
      {
        id: "openrouter/free",
        costRank: 3,
        label: { ru: "free auto", en: "free auto" },
      },
      {
        id: "poolside/laguna-xs.2:free",
        costRank: 4,
        label: { ru: "laguna xs free", en: "laguna xs free" },
      },
      {
        id: "nvidia/nemotron-nano-9b-v2:free",
        costRank: 5,
        label: { ru: "nemotron 9b free", en: "nemotron 9b free" },
      },
      {
        id: "google/gemma-2-9b-it:free",
        costRank: 6,
        label: { ru: "gemma2 9b free", en: "gemma2 9b free" },
      },
      {
        id: "qwen/qwen3-coder:free",
        costRank: 7,
        label: { ru: "qwen3 coder free", en: "qwen3 coder free" },
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct:free",
        costRank: 8,
        label: { ru: "llama 3.3 70b free", en: "llama 3.3 70b free" },
      },
    ],
  },
];

const catalogById = new Map(CHAT_PROVIDER_DEFS.map((item) => [item.id, item]));

export function isChatProviderId(value: string): value is ChatProviderId {
  return catalogById.has(value as ChatProviderId);
}

export function getDefaultLiteModel(providerId: ChatProviderId): string {
  const entry = catalogById.get(providerId);
  if (!entry || entry.models.length === 0) {
    return "gemini-2.5-flash-lite";
  }

  const sorted = [...entry.models].sort((a, b) => a.costRank - b.costRank);
  return sorted[0].id;
}

export function getDefaultProvider(): ChatProviderId {
  return "gemini";
}

export function resolveChatSelection(
  provider?: string,
  model?: string,
): { provider: ChatProviderId; model: string } {
  const resolvedProvider =
    provider && isChatProviderId(provider) ? provider : getDefaultProvider();
  const entry = catalogById.get(resolvedProvider)!;

  if (model && entry.models.some((item) => item.id === model)) {
    return { provider: resolvedProvider, model };
  }

  return { provider: resolvedProvider, model: getDefaultLiteModel(resolvedProvider) };
}

export function getDefaultModelForProvider(providerId: ChatProviderId): string {
  return getDefaultLiteModel(providerId);
}

export function isModelAllowedForProvider(providerId: ChatProviderId, model: string): boolean {
  const entry = catalogById.get(providerId);
  return entry?.models.some((item) => item.id === model) ?? false;
}

export function buildChatProviders(locale: Locale): ChatProviderOption[] {
  return CHAT_PROVIDER_DEFS.map((provider) => {
    const sorted = [...provider.models].sort((a, b) => a.costRank - b.costRank);
    const defaultModel = sorted[0].id;

    return {
      id: provider.id,
      label: provider.label,
      defaultModel,
      models: sorted.map((model) => ({
        id: model.id,
        label: model.label[locale],
        recommended: model.id === defaultModel,
      })),
    };
  });
}

/** @deprecated use CHAT_PROVIDER_DEFS */
export const CHAT_PROVIDER_CATALOG = CHAT_PROVIDER_DEFS.map((provider) => ({
  id: provider.id,
  defaultModel: getDefaultLiteModel(provider.id),
  models: provider.models.map((model) => ({
    id: model.id,
    recommended: model.costRank === Math.min(...provider.models.map((m) => m.costRank)),
  })),
}));

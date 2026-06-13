import type { ChatProvider, ChatProviderContext } from "@/lib/chat-providers/types";
import { assertLastUserMessage, toApiMessages } from "@/lib/chat-providers/messages";
import {
  CHAT_MAX_OUTPUT_TOKENS,
  CHAT_TEMPERATURE,
} from "@/lib/chat-generation-config";

type OpenAICompatibleConfig = {
  id: "groq" | "openrouter";
  apiKeyEnv: string;
  modelEnv: string;
  defaultModel: string;
  baseUrl: string;
  siteTitle?: string;
};

async function generateOpenAICompatible(
  config: OpenAICompatibleConfig,
  context: ChatProviderContext,
): Promise<string> {
  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`${config.apiKeyEnv} is not configured`);
  }

  const apiMessages = toApiMessages(context.messages);
  assertLastUserMessage(apiMessages);

  const model = context.model;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (config.id === "openrouter") {
    headers["HTTP-Referer"] = "https://nyrokume.dev";
    headers["X-Title"] = config.siteTitle ?? "nyrokume.dev";
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: context.systemPrompt },
        ...apiMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      temperature: CHAT_TEMPERATURE,
      max_tokens: CHAT_MAX_OUTPUT_TOKENS,
    }),
    signal: AbortSignal.timeout(45_000),
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    const detail = data.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`[${config.id}:${response.status}] ${detail}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error(`[${config.id}] Empty response from model`);
  }

  return text;
}

export function createOpenAICompatibleProvider(
  config: OpenAICompatibleConfig,
): ChatProvider {
  return {
    id: config.id,
    isConfigured: () => Boolean(process.env[config.apiKeyEnv]),
    generate: (context) => generateOpenAICompatible(config, context),
  };
}

export const groqProvider = createOpenAICompatibleProvider({
  id: "groq",
  apiKeyEnv: "GROQ_API_KEY",
  modelEnv: "GROQ_MODEL",
  defaultModel: "llama-3.3-70b-versatile",
  baseUrl: "https://api.groq.com/openai/v1",
});

export const openRouterProvider = createOpenAICompatibleProvider({
  id: "openrouter",
  apiKeyEnv: "OPENROUTER_API_KEY",
  modelEnv: "OPENROUTER_MODEL",
  defaultModel: "openrouter/free",
  baseUrl: "https://openrouter.ai/api/v1",
  siteTitle: "nyrokume.dev",
});

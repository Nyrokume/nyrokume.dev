import { buildChatSystemPrompt, buildChatScopeReminder } from "@/lib/chat-prompt";
import { getDefaultModelForProvider, resolveChatSelection } from "@/lib/chat-catalog";
import { PROVIDERS } from "@/lib/chat-providers/registry";
import type { ChatGenerateResult, ChatProviderId } from "@/lib/chat-providers/types";
import type { ChatMessage } from "@/lib/chat-types";
import type { Locale } from "@/lib/types";

function isRetryableProviderError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("[429") ||
    message.includes("[500") ||
    message.includes("[502") ||
    message.includes("[503") ||
    message.includes("[504") ||
    message.includes("quota") ||
    message.includes("Too Many Requests") ||
    message.includes("overloaded") ||
    message.includes("unavailable") ||
    message.includes("shut down") ||
    message.includes("deprecated") ||
    message.includes("not found") ||
    message.includes("fetch failed") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT")
  );
}

function getProviderAttemptOrder(preferred?: ChatProviderId): ChatProviderId[] {
  const configured = (["gemini", "groq", "openrouter"] as const).filter(
    (id) => PROVIDERS[id].isConfigured(),
  );

  if (!preferred) {
    return configured;
  }

  return [preferred, ...configured.filter((id) => id !== preferred)];
}

export type ChatGenerateOptions = {
  provider?: string;
  model?: string;
};

export async function generateChatReply(
  messages: ChatMessage[],
  locale: Locale = "ru",
  options: ChatGenerateOptions = {},
): Promise<ChatGenerateResult> {
  const selection = resolveChatSelection(options.provider, options.model);
  const attemptOrder = getProviderAttemptOrder(selection.provider);

  if (attemptOrder.length === 0) {
    throw new Error("No chat providers configured");
  }

  const systemPrompt = `${buildChatSystemPrompt(locale)}\n\n${buildChatScopeReminder(locale)}`;
  const failures: string[] = [];

  for (let index = 0; index < attemptOrder.length; index += 1) {
    const providerId = attemptOrder[index];
    const provider = PROVIDERS[providerId];
    const isLast = index === attemptOrder.length - 1;
    const model =
      providerId === selection.provider && index === 0
        ? selection.model
        : getDefaultModelForProvider(providerId);

    try {
      const content = await provider.generate({
        messages,
        locale,
        model,
        systemPrompt,
      });

      if (index > 0) {
        console.warn(`[chat] fallback used: ${providerId} (${model})`);
      }

      return { content, provider: providerId, model };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      failures.push(`${providerId}: ${detail}`);
      console.error(`[chat] ${providerId} failed`, error);

      if (!isRetryableProviderError(error)) {
        throw error;
      }

      if (!isLast) {
        continue;
      }
    }
  }

  throw new Error(failures.join(" | "));
}

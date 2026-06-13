import { generateChatReply as generateWithProviders } from "@/lib/chat-generate";
import type { ChatMessage } from "@/lib/chat-types";
import type { Locale } from "@/lib/types";

export async function generateChatReply(
  messages: ChatMessage[],
  locale: Locale = "ru",
  options: { provider?: string; model?: string } = {},
): Promise<string> {
  const result = await generateWithProviders(messages, locale, options);
  return result.content;
}

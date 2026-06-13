import type { ChatMessage } from "@/lib/chat-types";

/** Drop UI-only welcome bubble before sending to any provider. */
export function toApiMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length > 0 && messages[0].role === "assistant") {
    return messages.slice(1);
  }

  return messages;
}

export function assertLastUserMessage(messages: ChatMessage[]): ChatMessage {
  const lastMessage = messages.at(-1);

  if (!lastMessage || lastMessage.role !== "user") {
    throw new Error("Last message must be from the user");
  }

  return lastMessage;
}

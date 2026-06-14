#!/usr/bin/env node
/**
 * Reads TELEGRAM_BOT_TOKEN from .env.local or env, then prints chat ids
 * from getUpdates. Message your bot /start first (@nyrokume_noftify_bot).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadToken() {
  if (process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    return process.env.TELEGRAM_BOT_TOKEN.trim();
  }

  try {
    const envPath = join(process.cwd(), ".env.local");
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^TELEGRAM_BOT_TOKEN=(.+)$/);
      if (match?.[1]?.trim()) {
        return match[1].trim();
      }
    }
  } catch {
    // .env.local optional
  }

  return null;
}

const token = loadToken();

if (!token) {
  console.error("Set TELEGRAM_BOT_TOKEN in .env.local or the environment.");
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = await response.json();

if (!data.ok) {
  console.error("Telegram API error:", data.description ?? "unknown");
  process.exit(1);
}

const chats = new Map();

for (const update of data.result ?? []) {
  const chat = update.message?.chat ?? update.my_chat_member?.chat;
  if (!chat?.id) continue;

  chats.set(chat.id, {
    id: chat.id,
    type: chat.type,
    username: chat.username ?? "",
    title: chat.title ?? chat.first_name ?? "",
  });
}

if (chats.size === 0) {
  console.log("No chats yet. Open @nyrokume_noftify_bot in Telegram and send /start.");
  process.exit(0);
}

console.log("Use one of these as TELEGRAM_CHAT_ID:\n");
for (const chat of chats.values()) {
  const label = chat.username ? `@${chat.username}` : chat.title;
  console.log(`  ${chat.id}  (${chat.type}${label ? ` · ${label}` : ""})`);
}

console.log("\nThen: gh secret set TELEGRAM_CHAT_ID");
console.log("And add TELEGRAM_CHAT_ID=... to .env.local");

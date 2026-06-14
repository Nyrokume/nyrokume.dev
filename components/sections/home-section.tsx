"use client";

import { useEffect, useState } from "react";
import { ChatSection } from "@/components/sections/chat-section";
import { HeroSection } from "@/components/sections/hero-section";
import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal } from "@/components/ui/terminal-anim";

export function HomeSection() {
  const { content } = useLocale();
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    function syncFromHash() {
      setChatOpen(window.location.hash === "#chat");
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function openChat() {
    setChatOpen(true);
    window.history.replaceState(null, "", "#chat");
    requestAnimationFrame(() => {
      document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function closeChat() {
    setChatOpen(false);
    if (window.location.hash === "#chat") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  return (
    <div className="space-y-8">
      <HeroSection onOpenChat={openChat} chatOpen={chatOpen} />
      {chatOpen ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeChat}
              className="focus-ring cursor-pointer rounded border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {content.projects.chatCloseLabel}
            </button>
          </div>
          <TerminalReveal delay={120}>
            <ChatSection chat={content.projects.chat} cwd="~" />
          </TerminalReveal>
        </div>
      ) : null}
    </div>
  );
}

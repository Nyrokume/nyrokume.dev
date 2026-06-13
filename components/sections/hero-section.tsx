"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { StatCard } from "@/components/ui/stat-card";
import {
  TerminalReveal,
  TypewriterPrompt,
} from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import type { HeroAction } from "@/lib/types";

export function HeroSection() {
  const { content } = useLocale();
  const { hero } = content;

  return (
    <TerminalWindow
      title={hero.windowTitle}
      cwd="~"
      badge={
        <span className="rounded border border-terminal-success/40 bg-terminal-success/10 px-2 py-0.5 text-xs text-terminal-success">
          ● {hero.availableBadge}
        </span>
      }
    >
      <div className="space-y-5">
        <TerminalReveal delay={0} className="text-sm text-muted">
          {hero.bootLine}
        </TerminalReveal>

        <TypewriterPrompt command={hero.command} cwd="~" delay={200} />

        <motion.div
          className="pt-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <h1 className="flex min-w-0 items-center text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            <span className="shrink-0 text-muted-light">&gt;_ </span>
            <span className="truncate">{hero.heading}</span>
            <span
              className="ml-1 inline-block h-8 w-2 cursor-blink"
              aria-hidden
            />
          </h1>
          <p className="mt-3 text-sm text-muted">{hero.tagline}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {hero.stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        <motion.div
          className="flex flex-wrap gap-3 pt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 1.1 }}
        >
          {hero.actions.map((action) => (
            <HeroActionButton key={action.id} action={action} />
          ))}
        </motion.div>
      </div>
    </TerminalWindow>
  );
}

function HeroActionButton({ action }: { action: HeroAction }) {
  const [copied, setCopied] = useState(false);

  const baseClass =
    "focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors";
  const className = action.primary
    ? `${baseClass} border-accent/50 text-foreground hover:border-accent hover:bg-accent-muted`
    : `${baseClass} border-border text-muted-light hover:border-muted hover:text-foreground`;

  const icon = action.icon === "github" ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-3 .7-3.6-1.3-3.6-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.7 2.5 1.2.1-.9.4-1.5.7-1.8-2.4-.3-4.9-1.2-4.9-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.3 10.3 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.5 5.1-4.9 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  ) : action.icon === "mail" ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <path strokeWidth="2" d="M4 6h16v12H4z" />
      <path strokeWidth="2" d="m4 7 8 5 8-5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <rect x="9" y="9" width="10" height="10" strokeWidth="2" rx="1" />
      <path strokeWidth="2" d="M5 15V5h10" />
    </svg>
  );

  if (action.icon === "copy" && action.copyValue) {
    return (
      <button
        type="button"
        className={className}
        onClick={async () => {
          await navigator.clipboard.writeText(action.copyValue ?? "");
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {icon}
        {copied ? "copied!" : action.label}
      </button>
    );
  }

  const isExternal = action.href?.startsWith("http");
  const isMailto = action.href?.startsWith("mailto:");

  if (isExternal || isMailto) {
    return (
      <a
        href={action.href}
        target={isMailto ? undefined : "_blank"}
        rel={isMailto ? undefined : "noopener noreferrer"}
        className={className}
      >
        {icon}
        {action.label}
        {action.icon === "github" ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" aria-hidden>
            <path strokeWidth="2" d="M7 17 17 7M9 7h8v8" />
          </svg>
        ) : null}
      </a>
    );
  }

  return (
    <Link href={action.href ?? "/"} className={className}>
      {icon}
      {action.label}
    </Link>
  );
}

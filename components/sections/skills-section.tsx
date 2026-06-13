"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal, TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";

const folderIcons: Record<string, string> = {
  frontend: "◧",
  backend: "◨",
  tools: "◫",
  systems: "◩",
  other: "◪",
};

export function SkillsSection() {
  const { content } = useLocale();
  const { skills } = content;
  const totalItems = skills.categories.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );

  return (
    <TerminalWindow id="skills" title={skills.windowTitle} meta={skills.meta} cwd="~/skills">
      <div className="space-y-6">
        <TypewriterPrompt command={skills.command} cwd="~/skills" />

        <div className="space-y-4">
          {skills.categories.map((category, categoryIndex) => (
            <TerminalReveal key={category.id} delay={450 + categoryIndex * 120}>
              <div className="rounded border border-border bg-surface-elevated/50 p-4">
                <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                  <span className="text-terminal-success" aria-hidden>
                    drwxr-xr-x
                  </span>
                  <span className="text-muted-light" aria-hidden>
                    {folderIcons[category.id] ?? "▤"}
                  </span>
                  <span className="font-medium text-accent-bright">{category.label}</span>
                  {category.hint ? (
                    <span className="text-muted">{`// ${category.hint}`}</span>
                  ) : null}
                  <span className="text-muted">{`${category.items.length} entries`}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <span
                      key={item}
                      className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </TerminalReveal>
          ))}
        </div>

        <TerminalReveal
          delay={450 + skills.categories.length * 120 + 200}
          className="text-sm text-muted"
        >
          {skills.footerComment.replace("{total}", String(totalItems))}
        </TerminalReveal>
      </div>
    </TerminalWindow>
  );
}

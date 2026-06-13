"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal, TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";

const folderIcons: Record<string, string> = {
  frontend: "◧",
  backend: "◨",
  systems: "◩",
  scripting: "◪",
};

export function SkillsSection() {
  const { content } = useLocale();
  const { skills } = content;

  return (
    <TerminalWindow id="skills" title={skills.windowTitle} meta={skills.meta} cwd="~/skills">
      <div className="space-y-6">
        <TypewriterPrompt command={skills.command} cwd="~/skills" />

        <div className="space-y-5">
          {skills.categories.map((category, categoryIndex) => (
            <TerminalReveal key={category.id} delay={450 + categoryIndex * 150}>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-terminal-success" aria-hidden>
                    drwxr-xr-x
                  </span>
                  <span className="text-muted-light" aria-hidden>
                    {folderIcons[category.id] ?? "▤"}
                  </span>
                  <span className="font-medium text-foreground">{category.label}/</span>
                  <span className="text-muted">{`// ${category.items.length} entries`}</span>
                </div>
                <div className="flex flex-wrap gap-2 pl-6">
                  {category.items.map((item) => (
                    <span
                      key={item}
                      className="rounded border border-border bg-surface-elevated px-2.5 py-1 text-xs text-muted-light"
                    >
                      &quot;{item}&quot;
                    </span>
                  ))}
                </div>
              </div>
            </TerminalReveal>
          ))}
        </div>

        <TerminalReveal
          delay={450 + skills.categories.length * 150 + 200}
          className="text-sm text-muted"
        >
          {skills.footerComment}
        </TerminalReveal>
      </div>
    </TerminalWindow>
  );
}

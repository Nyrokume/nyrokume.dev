"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal, TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import type { SkillCategory, SkillGroup } from "@/lib/types";
import { countCategoryItems } from "@/lib/skills";

const folderIcons: Record<string, string> = {
  frontend: "◧",
  backend: "◨",
  api: "◰",
  frameworks: "◮",
  languages: "◩",
  tools: "◫",
  enterprise: "◭",
};

function SkillTags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-baseline rounded border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted-light transition-colors hover:border-accent/40 hover:text-foreground"
        >
          <span aria-hidden className="text-muted/60">
            &quot;
          </span>
          {item}
          <span aria-hidden className="text-muted/60">
            &quot;
          </span>
        </span>
      ))}
    </div>
  );
}

function CategoryHeader({
  category,
  itemCount,
}: {
  category: SkillCategory;
  itemCount: number;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border/60 pb-2 text-sm">
      <span className="text-muted-light" aria-hidden>
        {folderIcons[category.id] ?? "▤"}
      </span>
      <span className="font-medium text-accent-bright">{category.label}</span>
      {category.hint ? (
        <span className="text-muted">{`# ${category.hint}`}</span>
      ) : null}
      <span className="ml-auto text-xs tabular-nums text-muted">{itemCount}</span>
    </div>
  );
}

function SkillGroupPanel({ group }: { group: SkillGroup }) {
  return (
    <div className="rounded border border-border/80 bg-background/40 p-3">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
        <span className="font-medium text-foreground">{group.label}</span>
        {group.hint ? <span className="text-muted">{`# ${group.hint}`}</span> : null}
      </div>
      <SkillTags items={group.items} />
    </div>
  );
}

export function SkillsSection() {
  const { content } = useLocale();
  const { skills } = content;
  const totalItems = skills.categories.reduce(
    (sum, category) => sum + countCategoryItems(category),
    0,
  );

  return (
    <TerminalWindow id="skills" title={skills.windowTitle} meta={skills.meta} cwd="~/skills">
      <div className="space-y-6">
        <TypewriterPrompt command={skills.command} cwd="~/skills" />

        <div className="space-y-3">
          {skills.categories.map((category, categoryIndex) => (
            <TerminalReveal key={category.id} delay={450 + categoryIndex * 100}>
              <div className="rounded border border-border bg-surface-elevated/50 p-4">
                <CategoryHeader
                  category={category}
                  itemCount={countCategoryItems(category)}
                />

                {category.groups ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.groups.map((group) => (
                      <SkillGroupPanel key={group.label} group={group} />
                    ))}
                  </div>
                ) : (
                  <SkillTags items={category.items ?? []} />
                )}
              </div>
            </TerminalReveal>
          ))}
        </div>

        <TerminalReveal
          delay={450 + skills.categories.length * 100 + 200}
          className="text-sm text-muted"
        >
          {skills.footerComment.replace("{total}", String(totalItems))}
        </TerminalReveal>
      </div>
    </TerminalWindow>
  );
}

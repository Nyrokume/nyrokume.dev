"use client";

import { SkillCategoryIcon } from "@/components/icons/skill-category-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal, TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import type { SkillCategory, SkillGroup } from "@/lib/types";
import { countCategoryItems } from "@/lib/skills";

function categorySpansFull(category: SkillCategory): boolean {
  if (category.groups) return true;
  return countCategoryItems(category) > 6;
}

function SkillsIntro({
  categoryCount,
  total,
  locale,
}: {
  categoryCount: number;
  total: number;
  locale: string;
}) {
  const summary =
    locale === "ru"
      ? `${categoryCount} категорий · ${total} технологий`
      : `${categoryCount} categories · ${total} technologies`;

  return (
    <TerminalReveal delay={200}>
      <p className="text-sm leading-relaxed text-muted-light">{summary}</p>
    </TerminalReveal>
  );
}

function SkillTag({ item }: { item: string }) {
  return (
    <span className="inline-flex rounded border border-border bg-background px-2.5 py-1.5 text-sm text-foreground transition-colors hover:border-accent/45 hover:bg-accent-muted/15">
      {item}
    </span>
  );
}

function SkillTags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <SkillTag key={item} item={item} />
      ))}
    </div>
  );
}

function CategoryHeader({
  category,
  itemCount,
  locale,
}: {
  category: SkillCategory;
  itemCount: number;
  locale: string;
}) {
  const countLabel =
    locale === "ru"
      ? `${itemCount} ${itemCount === 1 ? "технология" : itemCount < 5 ? "технологии" : "технологий"}`
      : `${itemCount} ${itemCount === 1 ? "technology" : "technologies"}`;

  return (
    <header className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-light">
        <SkillCategoryIcon id={category.id} className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-base font-semibold text-accent-bright">{category.label}</h3>
          <span className="text-xs tabular-nums text-muted-light">{countLabel}</span>
        </div>
        {category.hint ? (
          <p className="mt-1 text-sm text-muted">{category.hint}</p>
        ) : null}
      </div>
    </header>
  );
}

function SkillGroupPanel({ group }: { group: SkillGroup }) {
  return (
    <div className="rounded-lg border border-border bg-background/45 p-4">
      <div className="mb-3 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{group.label}</p>
        {group.hint ? <p className="text-xs text-muted">{group.hint}</p> : null}
      </div>
      <SkillTags items={group.items} />
    </div>
  );
}

function SkillCategoryCard({
  category,
  locale,
  adjacent = false,
}: {
  category: SkillCategory;
  locale: string;
  adjacent?: boolean;
}) {
  const itemCount = countCategoryItems(category);

  return (
    <article
      className={`group relative h-full overflow-hidden bg-surface-elevated transition-colors ${
        adjacent
          ? "rounded-none border-0"
          : "rounded-lg border border-border hover:border-accent/35"
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1 bg-terminal-success/45 transition-colors group-hover:bg-terminal-success"
        aria-hidden
      />

      <CategoryHeader category={category} itemCount={itemCount} locale={locale} />

      <div className="px-4 py-4 pl-5 sm:px-5 sm:pl-6">
        {category.groups ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {category.groups.map((group) => (
              <SkillGroupPanel key={group.label} group={group} />
            ))}
          </div>
        ) : (
          <SkillTags items={category.items ?? []} />
        )}
      </div>
    </article>
  );
}

function SkillsFooter({ comment, total }: { comment: string; total: number }) {
  const parts = comment.split("{total}");

  return (
    <p className="text-sm leading-relaxed text-muted">
      {parts[0]}
      <span className="font-medium text-foreground">{total}</span>
      {parts[1] ?? ""}
    </p>
  );
}

export function SkillsSection() {
  const { content, locale } = useLocale();
  const { skills } = content;
  const totalItems = skills.categories.reduce(
    (sum, category) => sum + countCategoryItems(category),
    0,
  );

  const wideCategories: SkillCategory[] = [];
  const compactCategories: SkillCategory[] = [];

  skills.categories.forEach((category) => {
    if (categorySpansFull(category)) {
      wideCategories.push(category);
    } else {
      compactCategories.push(category);
    }
  });

  let revealIndex = 0;
  const nextDelay = (step = 1) => {
    const delay = 300 + revealIndex * 80;
    revealIndex += step;
    return delay;
  };

  return (
    <TerminalWindow id="skills" title={skills.windowTitle} meta={skills.meta} cwd="~/skills">
      <div className="space-y-6">
        <div className="space-y-3">
          <TypewriterPrompt command={skills.command} cwd="~/skills" />
          <SkillsIntro
            categoryCount={skills.categories.length}
            total={totalItems}
            locale={locale}
          />
        </div>

        <div className="space-y-4">
          {wideCategories.map((category) => (
            <TerminalReveal key={category.id} delay={nextDelay()}>
              <SkillCategoryCard category={category} locale={locale} />
            </TerminalReveal>
          ))}

          {compactCategories.length > 0 ? (
            <TerminalReveal delay={nextDelay()} className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {compactCategories.map((category, compactIndex) => (
                  <div
                    key={category.id}
                    className={
                      compactIndex > 0 ? "border-t border-border md:border-l md:border-t-0" : ""
                    }
                  >
                    <SkillCategoryCard category={category} locale={locale} adjacent />
                  </div>
                ))}
              </div>
            </TerminalReveal>
          ) : null}
        </div>

        <TerminalReveal delay={nextDelay()}>
          <SkillsFooter comment={skills.footerComment} total={totalItems} />
        </TerminalReveal>
      </div>
    </TerminalWindow>
  );
}

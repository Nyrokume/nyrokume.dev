import type { SkillCategory } from "@/lib/types";

export function getCategoryItems(category: SkillCategory): string[] {
  if (category.groups) {
    return category.groups.flatMap((group) => group.items);
  }

  return category.items ?? [];
}

export function countCategoryItems(category: SkillCategory): number {
  return getCategoryItems(category).length;
}

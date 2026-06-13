import { SkillsSection } from "@/components/sections/skills-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("skills");

export default function SkillsPage() {
  return <SkillsSection />;
}

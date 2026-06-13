import { ProjectsSection } from "@/components/sections/projects-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("projects");

export default function ProjectsPage() {
  return <ProjectsSection />;
}

import { AboutSection } from "@/components/sections/about-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("about");

export default function AboutPage() {
  return <AboutSection />;
}

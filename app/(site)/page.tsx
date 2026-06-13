import { HeroSection } from "@/components/sections/hero-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("home");

export default function HomePage() {
  return <HeroSection />;
}

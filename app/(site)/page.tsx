import { HomeSection } from "@/components/sections/home-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("home");

export default function HomePage() {
  return <HomeSection />;
}

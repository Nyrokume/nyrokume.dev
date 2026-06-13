import { ContactSection } from "@/components/sections/contact-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("contact");

export default function ContactPage() {
  return <ContactSection />;
}

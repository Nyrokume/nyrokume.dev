import { buildPersonJsonLd, buildWebSiteJsonLd } from "@/lib/seo";

export function SeoJsonLd() {
  const payload = [buildPersonJsonLd(), buildWebSiteJsonLd()];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

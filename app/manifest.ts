import type { MetadataRoute } from "next";
import { assetPath, PAGE_SEO, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: PAGE_SEO.home.description,
    start_url: assetPath("/"),
    scope: assetPath("/"),
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ff6b2b",
    lang: "ru",
    icons: [
      {
        src: assetPath("/icon.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: assetPath("/apple-icon.svg"),
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

import { JetBrains_Mono } from "next/font/google";
import type { Viewport } from "next";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { buildRootMetadata } from "@/lib/seo";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = buildRootMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${jetbrains.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <SeoJsonLd />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}

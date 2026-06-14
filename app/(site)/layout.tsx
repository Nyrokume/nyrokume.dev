import { TopBar } from "@/components/layout/top-bar";
import { SiteFooter } from "@/components/layout/site-footer";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TopBar />
      <main className="page-shell pb-8">{children}</main>
      <SiteFooter />
    </>
  );
}

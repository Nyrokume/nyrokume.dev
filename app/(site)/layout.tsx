import { TopBar } from "@/components/layout/top-bar";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TopBar />
      <main className="page-shell pb-12">{children}</main>
    </>
  );
}

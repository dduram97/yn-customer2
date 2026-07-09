"use client";

import { usePathname } from "next/navigation";
import type { ContactInfo, SiteConfig } from "@/lib/types";
import TopBar from "./TopBar";
import Footer from "./Footer";
import ActionBar from "./ActionBar";
import ScrollToTop from "./ScrollToTop";
import AnalyticsTracker from "./AnalyticsTracker";

interface AppShellProps {
  children: React.ReactNode;
  contactInfo: ContactInfo;
  siteConfig: SiteConfig;
}

export default function AppShell({
  children,
  contactInfo,
  siteConfig,
}: AppShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AnalyticsTracker />
      {!isHome && <TopBar />}
      <main
        className={`mx-auto w-full max-w-lg flex-1 ${
          isHome ? "px-4 py-4 pb-20" : "px-4 pt-8 pb-24"
        }`}
      >
        {children}
      </main>
      {!isHome && <Footer siteConfig={siteConfig} />}
      <ActionBar contactInfo={contactInfo} />
      <ScrollToTop />
    </>
  );
}

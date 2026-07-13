"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackAnalytics } from "@/lib/analytics-client";

/**
 * Fires page_view (and guide section_view) on every customer route change,
 * including `/`, `/guide/how-to-eat`, `/guide/storage`, `/tracking`, seafood details.
 * Persisted via POST /api/analytics/track → analytics_visits.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastPathRef.current === pathname) return;

    lastPathRef.current = pathname;
    trackAnalytics({
      type: "page_view",
      page: pathname,
    });

    if (pathname === "/guide/how-to-eat") {
      trackAnalytics({
        type: "section_view",
        page: pathname,
        categoryLabel: "손질법 페이지",
        categoryType: "handling",
      });
    }

    if (pathname === "/guide/storage") {
      trackAnalytics({
        type: "section_view",
        page: pathname,
        categoryLabel: "보관법 페이지",
        categoryType: "storage",
      });
    }

    if (pathname.includes("/seafood/") && pathname.endsWith("/cleaning")) {
      trackAnalytics({
        type: "section_view",
        page: pathname,
        categoryLabel: "손질법 상세",
        categoryType: "handling",
      });
    }

    if (pathname.includes("/seafood/") && pathname.endsWith("/storage")) {
      trackAnalytics({
        type: "section_view",
        page: pathname,
        categoryLabel: "보관법 상세",
        categoryType: "storage",
      });
    }
  }, [pathname]);

  return null;
}

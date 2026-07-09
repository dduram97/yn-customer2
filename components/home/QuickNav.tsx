"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { scrollToHomeSection } from "@/lib/home-scroll";
import { getQuickNavScrollHref, getQuickNavSectionId } from "@/lib/quick-nav";
import { trackMenuClick } from "@/lib/analytics-client";
import type { QuickNavItem } from "@/lib/types";

interface QuickNavProps {
  items: QuickNavItem[];
}

export default function QuickNav({ items }: QuickNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSectionClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
    label: string
  ) => {
    event.preventDefault();
    const scrollHref = `/#${sectionId}`;
    trackMenuClick(label, pathname);

    if (pathname === "/") {
      scrollToHomeSection(sectionId);
      window.history.pushState(null, "", scrollHref);
      return;
    }

    router.push(scrollHref);
  };

  const itemClassName =
    "flex shrink-0 items-center rounded-2xl border border-border bg-white px-4 py-3 shadow-sm active:bg-placeholder";

  return (
    <nav
      aria-label="빠른 메뉴"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide"
    >
      {items.map((item) => {
        const sectionId = getQuickNavSectionId(item.href);
        const href = getQuickNavScrollHref(item.href);

        if (sectionId) {
          return (
            <a
              key={`${item.label}-${href}`}
              href={href}
              onClick={(event) => handleSectionClick(event, sectionId, item.label)}
              className={itemClassName}
            >
              <span className="text-[15px] font-semibold text-black">{item.label}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => trackMenuClick(item.label, pathname)}
            className={itemClassName}
          >
            <span className="text-[15px] font-semibold text-black">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

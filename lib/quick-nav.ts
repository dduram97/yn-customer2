import type { QuickNavItem } from "@/lib/types";

const LEGACY_HREF_TO_SECTION: Record<string, string> = {
  "/guide/storage": "home-storage",
  "/guide/how-to-eat": "home-handling",
};

const QUICK_NAV_ORDER = ["소개", "손질법", "보관법", "자주묻는 질문"];

export function getQuickNavSectionId(href: string): string | null {
  if (LEGACY_HREF_TO_SECTION[href]) {
    return LEGACY_HREF_TO_SECTION[href];
  }

  const hashMatch = href.match(/^\/#(.+)$/);
  return hashMatch?.[1] ?? null;
}

export function getQuickNavScrollHref(href: string): string {
  const sectionId = getQuickNavSectionId(href);
  return sectionId ? `/#${sectionId}` : href;
}

export function normalizeQuickNavItems(items: QuickNavItem[]): QuickNavItem[] {
  const normalized = items.map((item) => ({
    ...item,
    href: getQuickNavScrollHref(item.href),
  }));

  return [...normalized].sort((a, b) => {
    const aIndex = QUICK_NAV_ORDER.indexOf(a.label);
    const bIndex = QUICK_NAV_ORDER.indexOf(b.label);

    if (aIndex === -1 || bIndex === -1) return 0;
    return aIndex - bIndex;
  });
}

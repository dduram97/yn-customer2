import type { TrackPayload } from "@/lib/analytics-types";

const SESSION_KEY = "yn-analytics-session-id";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export function trackAnalytics(payload: TrackPayload) {
  if (typeof window === "undefined") return;

  const body = {
    ...payload,
    sessionId: getAnalyticsSessionId(),
    referrer: document.referrer || undefined,
  };

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

export function trackMenuClick(menuLabel: string, page: string) {
  trackAnalytics({ type: "menu_click", page, menuLabel });
}

export function trackCategoryClick(
  categoryLabel: string,
  categoryType: string,
  page: string
) {
  trackAnalytics({ type: "category_click", page, categoryLabel, categoryType });
}

export function trackSectionView(
  categoryLabel: string,
  categoryType: string,
  page: string
) {
  trackAnalytics({ type: "section_view", page, categoryLabel, categoryType });
}

/** Track interest when a visitor opens a seafood cleaning/storage detail page. */
export function trackProductInterest(seafood: string, page: string) {
  const name = seafood.trim();
  if (!name) return;
  trackAnalytics({ type: "product_interest", page, seafood: name });
}

export function trackSearchQuery(query: string, hasResults: boolean) {
  const trimmed = query.trim();
  if (!trimmed) return;
  trackAnalytics({ type: "search", query: trimmed, hasResults });
}

export function trackSearchResultClick(
  query: string,
  clickedTarget: string,
  clickedHref?: string,
  clickedCategory?: string
) {
  trackAnalytics({
    type: "search_click",
    query: query.trim(),
    clickedTarget,
    clickedHref,
    clickedCategory,
  });
}

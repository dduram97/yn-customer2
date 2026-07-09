export type AnalyticsPeriod = "today" | "7d" | "30d" | "all";

export type VisitEventType =
  | "page_view"
  | "menu_click"
  | "category_click"
  | "section_view";

export type ConversionStep =
  | "search"
  | "content_click"
  | "product_view"
  | "purchase";

export interface SearchLogEntry {
  id: string;
  query: string;
  searchedAt: string;
  sessionId: string;
  clicked: boolean;
  clickedTarget?: string;
  clickedHref?: string;
  clickedCategory?: string;
  clickedAt?: string;
}

export interface VisitLogEntry {
  id: string;
  visitedAt: string;
  sessionId: string;
  eventType: VisitEventType;
  page: string;
  referrer?: string;
  menuLabel?: string;
  categoryLabel?: string;
  categoryType?: string;
}

export interface ConversionLogEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  step: ConversionStep;
  searchQuery?: string;
  contentId?: string;
  contentTitle?: string;
  page?: string;
  productId?: string;
  orderId?: string;
  metadata?: Record<string, string>;
}

export interface AnalyticsData {
  searchLogs: SearchLogEntry[];
  visitLogs: VisitLogEntry[];
  conversionLogs: ConversionLogEntry[];
}

export interface SearchRankingRow {
  rank: number;
  query: string;
  count: number;
  percent: number;
  lastSearchedAt: string;
  clickRate: number;
}

export interface SearchAnalyticsSummary {
  period: AnalyticsPeriod;
  totalSearches: number;
  top5: { label: string; percent: number }[];
  rankings: SearchRankingRow[];
}

export interface VisitorAnalyticsSummary {
  period: AnalyticsPeriod;
  todayVisitors: number;
  topPages: { rank: number; label: string; page: string; count: number }[];
  popularContent: { rank: number; label: string; count: number }[];
}

export type TrackPayload =
  | {
      type: "search";
      query: string;
    }
  | {
      type: "search_click";
      query: string;
      clickedTarget: string;
      clickedHref?: string;
      clickedCategory?: string;
    }
  | {
      type: "page_view";
      page: string;
      referrer?: string;
    }
  | {
      type: "menu_click";
      page: string;
      menuLabel: string;
    }
  | {
      type: "category_click";
      page: string;
      categoryLabel: string;
      categoryType: string;
    }
  | {
      type: "section_view";
      page: string;
      categoryLabel: string;
      categoryType: string;
    }
  | {
      type: "conversion";
      step: ConversionStep;
      searchQuery?: string;
      contentId?: string;
      contentTitle?: string;
      page?: string;
      productId?: string;
      orderId?: string;
      metadata?: Record<string, string>;
    };

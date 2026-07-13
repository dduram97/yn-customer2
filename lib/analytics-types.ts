export type AnalyticsPeriod = "day" | "month" | "year";

export type VisitEventType =
  | "page_view"
  | "menu_click"
  | "category_click"
  | "section_view"
  | "product_interest";

export type ConversionStep =
  | "search"
  | "content_click"
  | "product_view"
  | "purchase";

export interface TrendPoint {
  key: string;
  label: string;
  value: number;
}

export interface DonutSegment {
  label: string;
  value: number;
  percent: number;
}

export interface SearchRankingRow {
  rank: number;
  query: string;
  count: number;
  percent: number;
  successCount: number;
  failCount: number;
  lastSearchedAt: string;
  clickRate: number;
}

export interface SearchAnalyticsSummary {
  period: AnalyticsPeriod;
  anchorDate: string;
  totalSearches: number;
  successSearches: number;
  failSearches: number;
  donut: DonutSegment[];
  rankings: SearchRankingRow[];
  trend: TrendPoint[];
}

export interface RankingRow {
  rank: number;
  label: string;
  count: number;
  /** Optional path for page rankings */
  page?: string;
}

export interface SeafoodInterestRow {
  rank: number;
  seafood: string;
  visitors: number;
  percent: number;
}

export interface VisitorAnalyticsSummary {
  period: AnalyticsPeriod;
  /** Anchor date used for the period window (Asia/Seoul). */
  anchorDate: string;
  /** Distinct session_id with page_view in period */
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  todayVisitors: number;
  donut: DonutSegment[];
  trend: TrendPoint[];
  /** Unique visitors per page (page_view, DISTINCT session_id) */
  topPages: RankingRow[];
  /** Unique visitors for handling/cleaning content */
  topHandling: RankingRow[];
  /** Unique visitors for storage content */
  topStorage: RankingRow[];
  /** Combined popular content (handling + storage + section views) */
  popularContent: RankingRow[];
  /** Popular seafood interest (product_interest, DISTINCT session_id) */
  seafoodInterest: SeafoodInterestRow[];
}

export type TrackPayload =
  | {
      type: "search";
      query: string;
      hasResults: boolean;
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
      type: "product_interest";
      page: string;
      seafood: string;
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

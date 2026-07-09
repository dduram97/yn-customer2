import { promises as fs } from "fs";
import path from "path";
import type {
  AnalyticsData,
  AnalyticsPeriod,
  SearchAnalyticsSummary,
  SearchLogEntry,
  TrackPayload,
  VisitorAnalyticsSummary,
  VisitLogEntry,
} from "@/lib/analytics-types";

const ANALYTICS_PATH = path.join(process.cwd(), "data/analytics.json");

const EMPTY_DATA: AnalyticsData = {
  searchLogs: [],
  visitLogs: [],
  conversionLogs: [],
};

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureAnalyticsFile() {
  try {
    await fs.access(ANALYTICS_PATH);
  } catch {
    await fs.mkdir(path.dirname(ANALYTICS_PATH), { recursive: true });
    await fs.writeFile(ANALYTICS_PATH, JSON.stringify(EMPTY_DATA, null, 2), "utf-8");
  }
}

export async function readAnalyticsData(): Promise<AnalyticsData> {
  await ensureAnalyticsFile();
  const raw = await fs.readFile(ANALYTICS_PATH, "utf-8");
  return JSON.parse(raw) as AnalyticsData;
}

async function writeAnalyticsData(data: AnalyticsData) {
  await ensureAnalyticsFile();
  await fs.writeFile(ANALYTICS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function getPeriodStart(period: AnalyticsPeriod): Date | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = period === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
}

function isWithinPeriod(isoDate: string, period: AnalyticsPeriod): boolean {
  const start = getPeriodStart(period);
  if (!start) return true;
  return new Date(isoDate) >= start;
}

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export async function appendTrackEvent(
  payload: TrackPayload,
  sessionId: string,
  referrer?: string
) {
  const data = await readAnalyticsData();
  const now = new Date().toISOString();

  switch (payload.type) {
    case "search": {
      const entry: SearchLogEntry = {
        id: createId("search"),
        query: payload.query.trim(),
        searchedAt: now,
        sessionId,
        clicked: false,
      };
      data.searchLogs.push(entry);
      data.conversionLogs.push({
        id: createId("conv"),
        sessionId,
        timestamp: now,
        step: "search",
        searchQuery: entry.query,
        page: "/",
      });
      break;
    }
    case "search_click": {
      const normalizedQuery = payload.query.trim();
      const latest = [...data.searchLogs]
        .reverse()
        .find(
          (log) =>
            log.sessionId === sessionId &&
            log.query === normalizedQuery &&
            !log.clicked
        );

      if (latest) {
        latest.clicked = true;
        latest.clickedTarget = payload.clickedTarget;
        latest.clickedHref = payload.clickedHref;
        latest.clickedCategory = payload.clickedCategory;
        latest.clickedAt = now;
      } else {
        data.searchLogs.push({
          id: createId("search"),
          query: normalizedQuery,
          searchedAt: now,
          sessionId,
          clicked: true,
          clickedTarget: payload.clickedTarget,
          clickedHref: payload.clickedHref,
          clickedCategory: payload.clickedCategory,
          clickedAt: now,
        });
      }

      data.conversionLogs.push({
        id: createId("conv"),
        sessionId,
        timestamp: now,
        step: "content_click",
        searchQuery: normalizedQuery,
        contentTitle: payload.clickedTarget,
        page: payload.clickedHref,
        metadata: {
          category: payload.clickedCategory ?? "",
        },
      });
      break;
    }
    case "page_view": {
      const entry: VisitLogEntry = {
        id: createId("visit"),
        visitedAt: now,
        sessionId,
        eventType: "page_view",
        page: payload.page,
        referrer: payload.referrer ?? referrer,
      };
      data.visitLogs.push(entry);
      break;
    }
    case "menu_click": {
      data.visitLogs.push({
        id: createId("visit"),
        visitedAt: now,
        sessionId,
        eventType: "menu_click",
        page: payload.page,
        menuLabel: payload.menuLabel,
        referrer,
      });
      break;
    }
    case "category_click":
    case "section_view": {
      data.visitLogs.push({
        id: createId("visit"),
        visitedAt: now,
        sessionId,
        eventType: payload.type,
        page: payload.page,
        categoryLabel: payload.categoryLabel,
        categoryType: payload.categoryType,
        referrer,
      });
      break;
    }
    case "conversion": {
      data.conversionLogs.push({
        id: createId("conv"),
        sessionId,
        timestamp: now,
        step: payload.step,
        searchQuery: payload.searchQuery,
        contentId: payload.contentId,
        contentTitle: payload.contentTitle,
        page: payload.page,
        productId: payload.productId,
        orderId: payload.orderId,
        metadata: payload.metadata,
      });
      break;
    }
  }

  await writeAnalyticsData(data);
}

export async function getSearchAnalytics(
  period: AnalyticsPeriod
): Promise<SearchAnalyticsSummary> {
  const data = await readAnalyticsData();
  const logs = data.searchLogs.filter((log) =>
    isWithinPeriod(log.searchedAt, period)
  );

  const grouped = new Map<
    string,
    { count: number; clicks: number; lastSearchedAt: string }
  >();

  for (const log of logs) {
    const key = log.query.trim();
    if (!key) continue;
    const current = grouped.get(key) ?? {
      count: 0,
      clicks: 0,
      lastSearchedAt: log.searchedAt,
    };
    current.count += 1;
    if (log.clicked) current.clicks += 1;
    if (log.searchedAt > current.lastSearchedAt) {
      current.lastSearchedAt = log.searchedAt;
    }
    grouped.set(key, current);
  }

  const totalSearches = logs.length;
  const sorted = [...grouped.entries()].sort((a, b) => b[1].count - a[1].count);

  const topItems = sorted.slice(0, 5);
  const topCount = topItems.reduce((sum, [, value]) => sum + value.count, 0);
  const otherCount = Math.max(0, totalSearches - topCount);

  const top5 = topItems.map(([label, value]) => ({
    label,
    percent: totalSearches ? Math.round((value.count / totalSearches) * 100) : 0,
  }));

  if (otherCount > 0 && totalSearches > 0) {
    top5.push({
      label: "기타",
      percent: Math.round((otherCount / totalSearches) * 100),
    });
  }

  const rankings: SearchAnalyticsSummary["rankings"] = sorted.map(
    ([query, value], index) => ({
      rank: index + 1,
      query,
      count: value.count,
      percent: totalSearches
        ? Math.round((value.count / totalSearches) * 100)
        : 0,
      lastSearchedAt: formatDate(value.lastSearchedAt),
      clickRate: value.count
        ? Math.round((value.clicks / value.count) * 100)
        : 0,
    })
  );

  return {
    period,
    totalSearches,
    top5,
    rankings,
  };
}

const PAGE_LABELS: Record<string, string> = {
  "/": "홈",
  "/contact": "소개",
  "/faq": "자주 묻는 질문",
  "/notice": "공지사항",
  "/guide/how-to-eat": "손질법",
  "/guide/storage": "보관법",
};

function getPageLabel(page: string) {
  if (PAGE_LABELS[page]) return PAGE_LABELS[page];
  if (page.startsWith("/seafood/") && page.endsWith("/cleaning")) return "손질법 상세";
  if (page.startsWith("/seafood/") && page.endsWith("/storage")) return "보관법 상세";
  if (page.startsWith("/guide/how-to-eat")) return "손질법";
  if (page.startsWith("/guide/storage")) return "보관법";
  return page;
}

export async function getVisitorAnalytics(
  period: AnalyticsPeriod
): Promise<VisitorAnalyticsSummary> {
  const data = await readAnalyticsData();
  const visitLogs = data.visitLogs.filter((log) =>
    isWithinPeriod(log.visitedAt, period)
  );

  const todayStart = getPeriodStart("today")!;
  const todaySessions = new Set(
    data.visitLogs
      .filter(
        (log) =>
          log.eventType === "page_view" &&
          log.page === "/" &&
          new Date(log.visitedAt) >= todayStart
      )
      .map((log) => log.sessionId)
  );

  const pageCounts = new Map<string, number>();
  const contentCounts = new Map<string, number>();

  for (const log of visitLogs) {
    if (log.eventType === "page_view") {
      pageCounts.set(log.page, (pageCounts.get(log.page) ?? 0) + 1);
    }

    if (
      log.eventType === "category_click" ||
      log.eventType === "section_view"
    ) {
      const label = log.categoryLabel ?? getPageLabel(log.page);
      contentCounts.set(label, (contentCounts.get(label) ?? 0) + 1);
    }

    if (log.eventType === "menu_click" && log.menuLabel) {
      const key = `${log.menuLabel} 메뉴`;
      pageCounts.set(key, (pageCounts.get(key) ?? 0) + 1);
    }
  }

  const topPages = [...pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count], index) => ({
      rank: index + 1,
      label: getPageLabel(page) === page ? page : getPageLabel(page),
      page,
      count,
    }));

  const popularContent = [...contentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count], index) => ({
      rank: index + 1,
      label,
      count,
    }));

  return {
    period,
    todayVisitors: todaySessions.size,
    topPages,
    popularContent,
  };
}

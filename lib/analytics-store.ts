import {
  createSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type {
  AnalyticsPeriod,
  DonutSegment,
  SearchAnalyticsSummary,
  SearchRankingRow,
  TrackPayload,
  TrendPoint,
  VisitorAnalyticsSummary,
} from "@/lib/analytics-types";

const TZ = "Asia/Seoul";

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
  if (page.startsWith("/seafood/") && page.endsWith("/cleaning")) {
    return "손질법 상세";
  }
  if (page.startsWith("/seafood/") && page.endsWith("/storage")) {
    return "보관법 상세";
  }
  if (page.startsWith("/guide/how-to-eat")) return "손질법";
  if (page.startsWith("/guide/storage")) return "보관법";
  return page;
}

/** Period window in Asia/Seoul local time, returned as UTC ISO bounds. */
export function getPeriodBounds(period: AnalyticsPeriod, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const y = get("year");
  const m = get("month");
  const d = get("day");

  // Build Seoul local midnight as an Instant via Temporal-like offset trick:
  // format a known UTC date and compute offset, or use Date with explicit offset.
  const seoulOffsetMs = getSeoulOffsetMs(now);

  if (period === "day") {
    const startLocal = Date.UTC(y, m - 1, d, 0, 0, 0) - seoulOffsetMs;
    const endLocal = startLocal + 24 * 60 * 60 * 1000;
    return {
      start: new Date(startLocal),
      end: new Date(endLocal),
      year: y,
      month: m,
      day: d,
    };
  }

  if (period === "month") {
    const startLocal = Date.UTC(y, m - 1, 1, 0, 0, 0) - seoulOffsetMs;
    const endLocal = Date.UTC(y, m, 1, 0, 0, 0) - seoulOffsetMs;
    return {
      start: new Date(startLocal),
      end: new Date(endLocal),
      year: y,
      month: m,
      day: d,
    };
  }

  const startLocal = Date.UTC(y, 0, 1, 0, 0, 0) - seoulOffsetMs;
  const endLocal = Date.UTC(y + 1, 0, 1, 0, 0, 0) - seoulOffsetMs;
  return {
    start: new Date(startLocal),
    end: new Date(endLocal),
    year: y,
    month: m,
    day: d,
  };
}

function getSeoulOffsetMs(at: Date): number {
  // Asia/Seoul is UTC+9 year-round (no DST).
  void at;
  return 9 * 60 * 60 * 1000;
}

/** Parse admin UI date (Seoul calendar) into an Instant for getPeriodBounds. */
export function parseAnalyticsAnchor(
  period: AnalyticsPeriod,
  dateParam: string | null | undefined
): Date {
  if (!dateParam?.trim()) return new Date();

  if (period === "day" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return new Date(`${dateParam}T12:00:00+09:00`);
  }
  if (period === "month" && /^\d{4}-\d{2}$/.test(dateParam)) {
    return new Date(`${dateParam}-01T12:00:00+09:00`);
  }
  if (period === "year" && /^\d{4}$/.test(dateParam)) {
    return new Date(`${dateParam}-06-15T12:00:00+09:00`);
  }
  return new Date();
}

function formatAnchorDate(
  period: AnalyticsPeriod,
  bounds: ReturnType<typeof getPeriodBounds>
): string {
  if (period === "day") {
    return `${bounds.year}-${String(bounds.month).padStart(2, "0")}-${String(bounds.day).padStart(2, "0")}`;
  }
  if (period === "month") {
    return `${bounds.year}-${String(bounds.month).padStart(2, "0")}`;
  }
  return String(bounds.year);
}

function emptyDonut(labels: [string, string]): DonutSegment[] {
  return [
    { label: labels[0], value: 0, percent: 0 },
    { label: labels[1], value: 0, percent: 0 },
  ];
}

function toDonut(
  aLabel: string,
  aValue: number,
  bLabel: string,
  bValue: number
): DonutSegment[] {
  const total = aValue + bValue;
  if (total <= 0) return emptyDonut([aLabel, bLabel]);
  return [
    {
      label: aLabel,
      value: aValue,
      percent: Math.round((aValue / total) * 100),
    },
    {
      label: bLabel,
      value: bValue,
      percent: Math.round((bValue / total) * 100),
    },
  ];
}

function buildTrendBuckets(period: AnalyticsPeriod, bounds: ReturnType<typeof getPeriodBounds>): TrendPoint[] {
  if (period === "day") {
    return Array.from({ length: 24 }, (_, hour) => ({
      key: String(hour),
      label: `${hour}시`,
      value: 0,
    }));
  }

  if (period === "month") {
    const daysInMonth = new Date(bounds.year, bounds.month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        key: String(day),
        label: `${day}일`,
        value: 0,
      };
    });
  }

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      key: String(month),
      label: `${month}월`,
      value: 0,
    };
  });
}

function trendKeyFromIso(iso: string, period: AnalyticsPeriod): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  if (period === "day") return String(Number(get("hour")));
  if (period === "month") return String(Number(get("day")));
  return String(Number(get("month")));
}

function ensureAnalyticsReady() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Analytics DB is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

export async function appendTrackEvent(
  payload: TrackPayload,
  sessionId: string,
  referrer?: string
) {
  ensureAnalyticsReady();
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  switch (payload.type) {
    case "search": {
      const query = payload.query.trim();
      if (!query) return;
      const { error } = await supabase.from("analytics_searches").insert({
        session_id: sessionId,
        query,
        has_results: payload.hasResults === true,
        clicked: false,
        created_at: now,
      });
      if (error) throw error;
      return;
    }
    case "search_click": {
      const query = payload.query.trim();
      const { data: latest, error: findError } = await supabase
        .from("analytics_searches")
        .select("id")
        .eq("session_id", sessionId)
        .eq("query", query)
        .eq("clicked", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError) throw findError;

      if (latest?.id) {
        const { error } = await supabase
          .from("analytics_searches")
          .update({
            clicked: true,
            clicked_target: payload.clickedTarget,
            clicked_href: payload.clickedHref ?? null,
            clicked_category: payload.clickedCategory ?? null,
            clicked_at: now,
          })
          .eq("id", latest.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("analytics_searches").insert({
        session_id: sessionId,
        query,
        has_results: true,
        clicked: true,
        clicked_target: payload.clickedTarget,
        clicked_href: payload.clickedHref ?? null,
        clicked_category: payload.clickedCategory ?? null,
        clicked_at: now,
        created_at: now,
      });
      if (error) throw error;
      return;
    }
    case "page_view":
    case "menu_click":
    case "category_click":
    case "section_view":
    case "product_interest": {
      const row: Record<string, string | null> = {
        session_id: sessionId,
        event_type: payload.type,
        page: payload.page,
        referrer: null,
        menu_label: null,
        category_label: null,
        category_type: null,
        created_at: now,
      };

      if (payload.type === "page_view") {
        row.referrer = payload.referrer ?? referrer ?? null;
      } else if (payload.type === "menu_click") {
        row.menu_label = payload.menuLabel;
        row.referrer = referrer ?? null;
      } else if (payload.type === "product_interest") {
        // Seafood display name (e.g. 참문어). Optional `seafood` column mirrors this when migrated.
        row.category_label = payload.seafood.trim();
        row.category_type = "seafood";
        row.referrer = referrer ?? null;
      } else {
        row.category_label = payload.categoryLabel;
        row.category_type = payload.categoryType;
        row.referrer = referrer ?? null;
      }

      const withSeafood = {
        ...row,
        seafood: payload.type === "product_interest" ? payload.seafood.trim() : null,
      };

      let { error } = await supabase.from("analytics_visits").insert(withSeafood);
      if (error) {
        ({ error } = await supabase.from("analytics_visits").insert(row));
      }
      if (error) throw error;
      return;
    }
    case "conversion":
      // Conversion funnel storage reserved; visitor/search dashboards do not require it yet.
      return;
  }
}

export async function getSearchAnalytics(
  period: AnalyticsPeriod,
  anchor: Date = new Date()
): Promise<SearchAnalyticsSummary> {
  ensureAnalyticsReady();
  const supabase = createSupabaseAdmin();
  const bounds = getPeriodBounds(period, anchor);

  const { data, error } = await supabase
    .from("analytics_searches")
    .select("query, has_results, clicked, created_at")
    .gte("created_at", bounds.start.toISOString())
    .lt("created_at", bounds.end.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];
  const totalSearches = rows.length;
  const successSearches = rows.filter((row) => row.has_results).length;
  const failSearches = totalSearches - successSearches;

  const grouped = new Map<
    string,
    {
      count: number;
      success: number;
      fail: number;
      clicks: number;
      lastSearchedAt: string;
    }
  >();

  const trend = buildTrendBuckets(period, bounds);

  for (const row of rows) {
    const key = String(row.query ?? "").trim();
    if (!key) continue;

    const current = grouped.get(key) ?? {
      count: 0,
      success: 0,
      fail: 0,
      clicks: 0,
      lastSearchedAt: row.created_at,
    };
    current.count += 1;
    if (row.has_results) current.success += 1;
    else current.fail += 1;
    if (row.clicked) current.clicks += 1;
    if (row.created_at > current.lastSearchedAt) {
      current.lastSearchedAt = row.created_at;
    }
    grouped.set(key, current);

    const bucketKey = trendKeyFromIso(row.created_at, period);
    const bucket = trend.find((point) => point.key === bucketKey);
    if (bucket) bucket.value += 1;
  }

  const sorted = [...grouped.entries()].sort((a, b) => b[1].count - a[1].count);

  const rankings: SearchRankingRow[] = sorted.map(([query, value], index) => ({
    rank: index + 1,
    query,
    count: value.count,
    percent: totalSearches
      ? Math.round((value.count / totalSearches) * 100)
      : 0,
    successCount: value.success,
    failCount: value.fail,
    lastSearchedAt: value.lastSearchedAt.slice(0, 10),
    clickRate: value.count
      ? Math.round((value.clicks / value.count) * 100)
      : 0,
  }));

  return {
    period,
    anchorDate: formatAnchorDate(period, bounds),
    totalSearches,
    successSearches,
    failSearches,
    donut: toDonut("성공 검색", successSearches, "실패 검색", failSearches),
    rankings,
    trend,
  };
}

export async function getVisitorAnalytics(
  period: AnalyticsPeriod,
  anchor: Date = new Date()
): Promise<VisitorAnalyticsSummary> {
  ensureAnalyticsReady();
  const supabase = createSupabaseAdmin();
  const bounds = getPeriodBounds(period, anchor);
  const todayBounds = getPeriodBounds("day", new Date());

  const { data: firstSeenRows, error: firstSeenError } = await supabase.rpc(
    "analytics_session_first_seen"
  );

  if (firstSeenError) throw firstSeenError;

  const firstSeen = new Map<string, string>();
  for (const row of firstSeenRows ?? []) {
    firstSeen.set(row.session_id, row.first_seen);
  }

  const { data: periodVisits, error: periodError } = await supabase
    .from("analytics_visits")
    .select(
      "session_id, event_type, page, menu_label, category_label, category_type, created_at"
    )
    .gte("created_at", bounds.start.toISOString())
    .lt("created_at", bounds.end.toISOString())
    .order("created_at", { ascending: true });

  if (periodError) throw periodError;

  const visits = periodVisits ?? [];
  const periodSessions = new Set<string>();
  /** page -> unique session_ids (page_view only) */
  const pageSessions = new Map<string, Set<string>>();
  const handlingSessions = new Map<string, Set<string>>();
  const storageSessions = new Map<string, Set<string>>();
  const allContentSessions = new Map<string, Set<string>>();
  const seafoodSessions = new Map<string, Set<string>>();
  const seafoodInterestVisitors = new Set<string>();
  const trend = buildTrendBuckets(period, bounds);
  const sessionHourOrBucket = new Map<string, Set<string>>();

  function addUnique(
    map: Map<string, Set<string>>,
    key: string,
    sessionId: string
  ) {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(sessionId);
  }

  for (const log of visits) {
    if (log.event_type === "page_view") {
      periodSessions.add(log.session_id);
      addUnique(pageSessions, log.page, log.session_id);

      const bucketKey = trendKeyFromIso(log.created_at, period);
      if (!sessionHourOrBucket.has(bucketKey)) {
        sessionHourOrBucket.set(bucketKey, new Set());
      }
      sessionHourOrBucket.get(bucketKey)!.add(log.session_id);

      if (log.page.includes("/seafood/") && log.page.endsWith("/cleaning")) {
        addUnique(handlingSessions, getPageLabel(log.page), log.session_id);
        addUnique(allContentSessions, getPageLabel(log.page), log.session_id);
      }
      if (log.page.includes("/seafood/") && log.page.endsWith("/storage")) {
        addUnique(storageSessions, getPageLabel(log.page), log.session_id);
        addUnique(allContentSessions, getPageLabel(log.page), log.session_id);
      }
      if (log.page === "/guide/how-to-eat") {
        addUnique(handlingSessions, "손질법 목록", log.session_id);
        addUnique(allContentSessions, "손질법 목록", log.session_id);
      }
      if (log.page === "/guide/storage") {
        addUnique(storageSessions, "보관법 목록", log.session_id);
        addUnique(allContentSessions, "보관법 목록", log.session_id);
      }
    }

    if (log.event_type === "product_interest") {
      const seafood = String(log.category_label || "").trim();
      if (seafood) {
        seafoodInterestVisitors.add(log.session_id);
        addUnique(seafoodSessions, seafood, log.session_id);
      }
    }

    if (
      log.event_type === "category_click" ||
      log.event_type === "section_view"
    ) {
      const label = log.category_label ?? getPageLabel(log.page);
      addUnique(allContentSessions, label, log.session_id);
      const type = String(log.category_type ?? "");
      if (type === "handling" || type === "cleaning") {
        addUnique(handlingSessions, label, log.session_id);
      } else if (type === "storage") {
        addUnique(storageSessions, label, log.session_id);
      }
    }
  }

  for (const point of trend) {
    point.value = sessionHourOrBucket.get(point.key)?.size ?? 0;
  }

  let newVisitors = 0;
  let returningVisitors = 0;
  for (const sessionId of periodSessions) {
    const first = firstSeen.get(sessionId);
    if (!first) {
      newVisitors += 1;
      continue;
    }
    const firstMs = new Date(first).getTime();
    if (firstMs >= bounds.start.getTime() && firstMs < bounds.end.getTime()) {
      newVisitors += 1;
    } else if (firstMs < bounds.start.getTime()) {
      returningVisitors += 1;
    } else {
      newVisitors += 1;
    }
  }

  const { data: todayRows, error: todayError } = await supabase
    .from("analytics_visits")
    .select("session_id")
    .eq("event_type", "page_view")
    .gte("created_at", todayBounds.start.toISOString())
    .lt("created_at", todayBounds.end.toISOString());
  if (todayError) throw todayError;
  const todayVisitors = new Set(
    (todayRows ?? []).map((row) => row.session_id)
  ).size;

  function toRanking(map: Map<string, Set<string>>, withPage = false) {
    return [...map.entries()]
      .map(([key, sessions]) => ({
        key,
        count: sessions.size,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        label: withPage ? getPageLabel(item.key) : item.key,
        page: withPage ? item.key : undefined,
        count: item.count,
      }));
  }

  const interestTotal = seafoodInterestVisitors.size;
  const seafoodInterest = [...seafoodSessions.entries()]
    .map(([seafood, sessions]) => ({
      seafood,
      visitors: sessions.size,
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 20)
    .map((item, index) => ({
      rank: index + 1,
      seafood: item.seafood,
      visitors: item.visitors,
      percent: interestTotal
        ? Math.round((item.visitors / interestTotal) * 100)
        : 0,
    }));

  return {
    period,
    anchorDate: formatAnchorDate(period, bounds),
    totalVisitors: periodSessions.size,
    newVisitors,
    returningVisitors,
    todayVisitors,
    donut: toDonut("신규 방문", newVisitors, "재방문", returningVisitors),
    trend,
    topPages: toRanking(pageSessions, true),
    topHandling: toRanking(handlingSessions),
    topStorage: toRanking(storageSessions),
    popularContent: toRanking(allContentSessions),
    seafoodInterest,
  };
}

import { NextResponse } from "next/server";
import {
  getSearchAnalytics,
  getVisitorAnalytics,
  parseAnalyticsAnchor,
} from "@/lib/analytics-store";
import type { AnalyticsPeriod } from "@/lib/analytics-types";

function parsePeriod(value: string | null): AnalyticsPeriod {
  if (value === "day" || value === "month" || value === "year") {
    return value;
  }
  if (value === "today") return "day";
  if (value === "7d" || value === "30d" || value === "all") return "month";
  return "day";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const period = parsePeriod(searchParams.get("period"));
    const anchor = parseAnalyticsAnchor(period, searchParams.get("date"));

    if (type === "search") {
      const data = await getSearchAnalytics(period, anchor);
      return NextResponse.json(data);
    }

    if (type === "visitor") {
      const data = await getVisitorAnalytics(period, anchor);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics";
    console.error("[admin/analytics]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

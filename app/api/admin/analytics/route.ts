import { NextResponse } from "next/server";
import { getSearchAnalytics, getVisitorAnalytics } from "@/lib/analytics-store";
import type { AnalyticsPeriod } from "@/lib/analytics-types";

function parsePeriod(value: string | null): AnalyticsPeriod {
  if (value === "today" || value === "7d" || value === "30d" || value === "all") {
    return value;
  }
  return "7d";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const period = parsePeriod(searchParams.get("period"));

  if (type === "search") {
    const data = await getSearchAnalytics(period);
    return NextResponse.json(data);
  }

  if (type === "visitor") {
    const data = await getVisitorAnalytics(period);
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

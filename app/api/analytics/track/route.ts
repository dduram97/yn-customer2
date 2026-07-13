import { NextResponse } from "next/server";
import { appendTrackEvent } from "@/lib/analytics-store";
import type { TrackPayload } from "@/lib/analytics-types";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Analytics DB is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as TrackPayload & {
      sessionId?: string;
      referrer?: string;
    };

    if (!body?.type || !body.sessionId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { sessionId, referrer, ...payload } = body;
    await appendTrackEvent(payload as TrackPayload, sessionId, referrer);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to track event";
    console.error("[analytics/track]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { appendTrackEvent } from "@/lib/analytics-store";
import type { TrackPayload } from "@/lib/analytics-types";

export async function POST(request: Request) {
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
}

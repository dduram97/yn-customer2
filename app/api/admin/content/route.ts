import { NextResponse } from "next/server";
import { assertSupabaseOnVercel } from "@/lib/deployment";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";
import { revalidateCustomerPages } from "@/lib/revalidate-site";
import type { SiteContent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "콘텐츠를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    assertSupabaseOnVercel();
    const content = (await request.json()) as SiteContent;
    await saveSiteContent(content);
    revalidateCustomerPages();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "저장에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

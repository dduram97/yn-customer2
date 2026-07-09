import { NextResponse } from "next/server";
import { assertSupabaseOnVercel } from "@/lib/deployment";
import { readSiteContentFile, writeSiteContentFile } from "@/lib/site-content-file";
import { DEFAULT_SITE_CONTENT, normalizeSiteContent } from "@/lib/site-content";
import { persistSiteContentToStore } from "@/lib/site-content-store";
import { revalidateCustomerPages } from "@/lib/revalidate-site";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** One-time import: local JSON → Supabase (run after schema.sql). */
export async function POST() {
  try {
    assertSupabaseOnVercel();

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 }
      );
    }

    const fileContent = await readSiteContentFile();
    const content = normalizeSiteContent(fileContent ?? DEFAULT_SITE_CONTENT);
    await persistSiteContentToStore(content, normalizeSiteContent);
    await writeSiteContentFile(content);
    revalidateCustomerPages();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "마이그레이션에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

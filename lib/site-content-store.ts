import {
  createSupabaseAdmin,
  isSupabaseConfigured,
  supabaseTables,
} from "@/lib/supabase/server";
import { isVercelRuntime } from "@/lib/deployment";
import {
  ensureContentFile,
  readSiteContentFile,
  writeSiteContentFile,
} from "@/lib/site-content-file";
import type { SiteContent } from "@/lib/types";

async function seedFromLocalFile(
  fallback: SiteContent,
  normalize: (content: SiteContent) => SiteContent
): Promise<SiteContent | null> {
  const fileContent = await readSiteContentFile();
  if (!fileContent && isVercelRuntime()) {
    return normalize(fallback);
  }
  if (!fileContent) return null;
  return normalize(fileContent);
}

export async function loadSiteContentFromStore(
  fallback: SiteContent,
  normalize: (content: SiteContent) => SiteContent
): Promise<SiteContent> {
  if (!isSupabaseConfigured()) {
    await ensureContentFile(fallback);
    const fileContent = await readSiteContentFile();
    return normalize(fileContent ?? fallback);
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(supabaseTables.siteContent)
    .select("content")
    .eq("id", supabaseTables.siteContentRowId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load site content: ${error.message}`);
  }

  if (data?.content) {
    return normalize(data.content as SiteContent);
  }

  // DB empty: one-time seed from committed JSON (non-destructive, does not delete file).
  const initial =
    (await seedFromLocalFile(fallback, normalize)) ?? normalize(fallback);
  await persistSiteContentToStore(initial, normalize);
  return initial;
}

export async function persistSiteContentToStore(
  content: SiteContent,
  normalize: (content: SiteContent) => SiteContent
): Promise<void> {
  const normalized = normalize(content);

  if (!isSupabaseConfigured()) {
    await ensureContentFile(normalized);
    await writeSiteContentFile(normalized);
    return;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from(supabaseTables.siteContent).upsert(
    {
      id: supabaseTables.siteContentRowId,
      content: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`Failed to save site content: ${error.message}`);
  }

  // Local JSON backup only in non-Vercel environments (dev / migration).
  if (!isVercelRuntime()) {
    try {
      await writeSiteContentFile(normalized);
    } catch {
      // Ignore local write errors.
    }
  }
}

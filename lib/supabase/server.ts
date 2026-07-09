import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SITE_CONTENT_TABLE = "site_content";
const SITE_CONTENT_ROW_ID = "main";
const UPLOADS_BUCKET = "uploads";

function decodeJwtRole(key: string): string | null {
  try {
    const parts = key.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { role?: string };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function assertServiceRoleKey(serviceRoleKey: string): void {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (anonKey && serviceRoleKey === anonKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must not be the anon key. Use the service_role secret from Supabase Dashboard → Settings → API."
    );
  }

  const role = decodeJwtRole(serviceRoleKey);
  if (role && role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is a "${role}" key. Use the service_role secret, not the anon/public key.`
    );
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** Server-only Supabase client (service_role). Never use in client components. */
export function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  assertServiceRoleKey(serviceRoleKey);

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  });
}

export const supabaseTables = {
  siteContent: SITE_CONTENT_TABLE,
  siteContentRowId: SITE_CONTENT_ROW_ID,
  uploadsBucket: UPLOADS_BUCKET,
} as const;

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
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

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

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/**
 * Cursor / local MITM proxies (HTTP_PROXY=127.0.0.1:…) break Supabase HTTPS.
 * Ensure the Supabase project host is listed in NO_PROXY before createClient/fetch.
 */
function ensureSupabaseBypassesProxy(supabaseUrl: string): void {
  let hostname: string;
  try {
    hostname = new URL(supabaseUrl).hostname;
  } catch {
    return;
  }

  if (!hostname) return;

  const keys = ["NO_PROXY", "no_proxy"] as const;
  for (const key of keys) {
    const current = process.env[key] ?? "";
    const parts = current
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const needed = [hostname, ".supabase.co", "*.supabase.co"];
    let changed = false;
    for (const entry of needed) {
      if (!parts.includes(entry)) {
        parts.push(entry);
        changed = true;
      }
    }
    if (changed) {
      process.env[key] = parts.join(",");
    }
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL") && readEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

/** Server-only Supabase client (service_role). Never use in client components. */
export function createSupabaseAdmin(): SupabaseClient {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  assertServiceRoleKey(serviceRoleKey);
  ensureSupabaseBypassesProxy(url);

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

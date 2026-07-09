import { isSupabaseConfigured } from "@/lib/supabase/server";

/** True when running on Vercel (production or preview). */
export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

/** Supabase is required for persistent CMS on Vercel. */
export function assertSupabaseOnVercel(): void {
  if (!isVercelRuntime()) return;

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Vercel 배포 환경에서는 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다."
    );
  }
}

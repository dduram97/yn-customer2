/**
 * Real admin-save E2E (not direct store edits):
 * login → GET content → patch storageGuides[].imageUrl → PUT save
 * → GET content (fresh) → GET customer detail HTML → revert
 *
 * Usage: node --env-file=.env.local scripts/e2e-admin-hero-save.mjs [baseUrl]
 */
import { createClient } from "@supabase/supabase-js";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const GUIDE_ID = "octopus";
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error("ADMIN_PASSWORD missing in env");
  process.exit(1);
}

function cookieJar() {
  const map = new Map();
  return {
    store(res) {
      const raw = res.headers.getSetCookie?.() || [];
      for (const line of raw) {
        const pair = line.split(";")[0];
        const i = pair.indexOf("=");
        if (i > 0) map.set(pair.slice(0, i), pair.slice(i + 1));
      }
      const single = res.headers.get("set-cookie");
      if (single && raw.length === 0) {
        const pair = single.split(";")[0];
        const i = pair.indexOf("=");
        if (i > 0) map.set(pair.slice(0, i), pair.slice(i + 1));
      }
    },
    header() {
      return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function main() {
  const jar = cookieJar();
  const report = [];

  const loginRes = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  jar.store(loginRes);
  const loginBody = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok || !loginBody.success) {
    throw new Error(`login failed: ${loginRes.status} ${JSON.stringify(loginBody)}`);
  }
  report.push("1) admin login: OK");

  const beforeRes = await fetch(`${BASE}/api/admin/content`, {
    headers: { Cookie: jar.header() },
  });
  jar.store(beforeRes);
  const before = await beforeRes.json();
  if (!beforeRes.ok || before.error) {
    throw new Error(`GET content failed: ${JSON.stringify(before)}`);
  }

  const guide = before.storageGuides.find((g) => g.id === GUIDE_ID);
  const preview = before.productPreviews.find((p) => p.id === GUIDE_ID);
  if (!guide || !preview) throw new Error("octopus guide/preview missing");

  const oldHero = guide.imageUrl || "";
  const cardUrl = preview.imageUrl || "";
  const marker = `https://example.com/e2e-admin-hero-${Date.now()}.png`;
  guide.imageUrl = marker;

  report.push(`2) before hero: ${oldHero}`);
  report.push(`2) before card: ${cardUrl}`);
  report.push(`2) new hero marker: ${marker}`);

  const saveRes = await fetch(`${BASE}/api/admin/content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: jar.header(),
    },
    body: JSON.stringify(before),
  });
  const saveBody = await saveRes.json().catch(() => ({}));
  if (!saveRes.ok || !saveBody.success) {
    throw new Error(`PUT save failed: ${saveRes.status} ${JSON.stringify(saveBody)}`);
  }
  report.push("3) admin PUT /api/admin/content: OK (save button path)");

  const afterRes = await fetch(`${BASE}/api/admin/content`, {
    headers: { Cookie: jar.header() },
  });
  const after = await afterRes.json();
  const afterHero = after.storageGuides.find((g) => g.id === GUIDE_ID)?.imageUrl;
  const afterCard = after.productPreviews.find((p) => p.id === GUIDE_ID)?.imageUrl;
  const apiHeroOk = afterHero === marker;
  const apiCardOk = afterCard === cardUrl;
  report.push(`4) API after save hero: ${afterHero}`);
  report.push(`4) API hero matches marker: ${apiHeroOk}`);
  report.push(`4) API card unchanged: ${apiCardOk}`);
  if (!apiHeroOk) throw new Error("API did not return new hero after save");

  // Direct Supabase read (same DB the admin save wrote to)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let dbHeroOk = false;
  if (supabaseUrl && serviceKey) {
    const host = new URL(supabaseUrl).hostname;
    process.env.NO_PROXY = [process.env.NO_PROXY, host, ".supabase.co"]
      .filter(Boolean)
      .join(",");
    const sb = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb
      .from("site_content")
      .select("content, updated_at")
      .eq("id", "main")
      .maybeSingle();
    if (error) {
      report.push(`5) Supabase direct read: FAIL (${error.message})`);
    } else {
      const dbHero = data?.content?.storageGuides?.find((g) => g.id === GUIDE_ID)
        ?.imageUrl;
      dbHeroOk = dbHero === marker;
      report.push(`5) Supabase DB hero: ${dbHero}`);
      report.push(`5) Supabase DB matches marker: ${dbHeroOk}`);
      report.push(`5) Supabase updated_at: ${data?.updated_at}`);
    }
  } else {
    report.push("5) Supabase direct read: SKIPPED (env missing)");
  }

  const detailRes = await fetch(`${BASE}/seafood/${GUIDE_ID}/storage`, {
    cache: "no-store",
  });
  const detailHtml = await detailRes.text();
  const detailHasNew = detailHtml.includes(marker);
  const detailHasOld = oldHero ? detailHtml.includes(oldHero) : false;
  const detailImgs = [...detailHtml.matchAll(/<(?:img|video)[^>]+src="([^"]+)"/g)].map(
    (m) => m[1]
  );
  report.push(`6) detail HTTP: ${detailRes.status}`);
  report.push(`6) detail media: ${JSON.stringify(detailImgs)}`);
  report.push(`6) detail has NEW hero: ${detailHasNew}`);
  report.push(`6) detail has OLD hero: ${detailHasOld}`);

  const homeRes = await fetch(`${BASE}/`, { cache: "no-store" });
  const homeHtml = await homeRes.text();
  const homeHasCard = cardUrl ? homeHtml.includes(cardUrl) : false;
  const homeHasNew = homeHtml.includes(marker);
  report.push(`7) home has card url: ${homeHasCard}`);
  report.push(`7) home has NEW hero: ${homeHasNew}`);

  // Revert via same admin save path
  guide.imageUrl = oldHero;
  const revertRes = await fetch(`${BASE}/api/admin/content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: jar.header(),
    },
    body: JSON.stringify(before),
  });
  const revertBody = await revertRes.json().catch(() => ({}));
  report.push(
    `8) revert save: ${revertRes.ok && revertBody.success ? "OK" : JSON.stringify(revertBody)}`
  );

  console.log(report.join("\n"));

  const pass =
    apiHeroOk &&
    apiCardOk &&
    detailHasNew &&
    !detailHasOld &&
    homeHasCard &&
    !homeHasNew &&
    (dbHeroOk || report.some((line) => line.includes("Supabase direct read: FAIL") || line.includes("SKIPPED")));

  // Strict: if Supabase was readable, DB must match. If not readable, still require API+detail.
  if (report.some((line) => line.includes("Supabase DB matches marker: false"))) {
    console.error("\nRESULT: FAIL (Supabase DB did not get new imageUrl)");
    process.exit(1);
  }
  if (!apiHeroOk || !detailHasNew || detailHasOld) {
    console.error("\nRESULT: FAIL (customer detail did not show new hero after admin save)");
    process.exit(1);
  }
  if (homeHasNew) {
    console.error("\nRESULT: FAIL (home unexpectedly showed detail hero)");
    process.exit(1);
  }

  console.log("\nRESULT: PASS");
  console.log(
    dbHeroOk
      ? "Verified: admin save → Supabase DB → customer detail"
      : "Verified: admin save → API fresh read → customer detail (direct DB read unavailable in this shell)"
  );
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error("RESULT: FAIL");
  console.error(err);
  process.exit(1);
});

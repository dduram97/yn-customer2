#!/usr/bin/env node
/**
 * Next.js .next 캐시 검사 및 정리
 *
 * Usage:
 *   node scripts/next-cache.js ensure-dev  # dev 시작 전 자동 정리 (predev)
 *   node scripts/next-cache.js check       # 상태만 검사 (비정상 시 exit 1)
 *   node scripts/next-cache.js clean       # .next 삭제
 */

const fs = require("fs");
const path = require("path");

const NEXT_DIR = path.join(process.cwd(), ".next");
const SERVER_DIR = path.join(NEXT_DIR, "server");
const ROUTES_MANIFEST = path.join(NEXT_DIR, "routes-manifest.json");
const BUILD_ID_FILE = path.join(NEXT_DIR, "BUILD_ID");

function exists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function listJsFiles(dir) {
  const files = [];

  function walk(currentDir) {
    if (!exists(currentDir)) return;

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".js")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function collectMissingServerChunks() {
  const missing = new Set();
  const sources = listJsFiles(SERVER_DIR);

  for (const filePath of sources) {
    const source = readText(filePath);
    if (!source) continue;

    const refs = source.matchAll(/require\("\.\/(\d+)\.js"\)/g);
    for (const match of refs) {
      const chunkId = match[1];
      const chunkPath = path.join(SERVER_DIR, `${chunkId}.js`);
      if (!exists(chunkPath)) {
        missing.add(chunkId);
      }
    }
  }

  return [...missing];
}

function inspectCache() {
  if (!exists(NEXT_DIR)) {
    return { healthy: true, issues: [] };
  }

  const issues = [];

  if (exists(BUILD_ID_FILE)) {
    issues.push({
      code: "PRODUCTION_BUILD",
      message: "Production build cache detected (BUILD_ID exists).",
    });
  }

  if (exists(SERVER_DIR) && !exists(ROUTES_MANIFEST)) {
    issues.push({
      code: "MISSING_ROUTES_MANIFEST",
      message: "routes-manifest.json is missing while server output exists.",
    });
  }

  const missingChunks = collectMissingServerChunks();
  if (missingChunks.length > 0) {
    issues.push({
      code: "MISSING_SERVER_CHUNKS",
      message: `Missing server chunks: ${missingChunks.join(", ")}`,
    });
  }

  return { healthy: issues.length === 0, issues };
}

function cleanCache(reason) {
  if (!exists(NEXT_DIR)) {
    console.log("[next-cache] .next does not exist. Nothing to clean.");
    return;
  }

  console.warn(`[next-cache] ${reason}`);
  fs.rmSync(NEXT_DIR, { recursive: true, force: true });
  console.log("[next-cache] Removed .next");
}

function ensureDev() {
  const { healthy, issues } = inspectCache();

  if (healthy) {
    if (exists(NEXT_DIR)) {
      console.log("[next-cache] Dev cache looks healthy.");
    }
    return 0;
  }

  const reason = issues.map((issue) => issue.message).join(" ");
  cleanCache(reason);
  return 0;
}

function check() {
  const { healthy, issues } = inspectCache();

  if (healthy) {
    console.log("[next-cache] OK");
    return 0;
  }

  for (const issue of issues) {
    console.error(`[next-cache] ${issue.message}`);
  }
  return 1;
}

function noteProduction() {
  console.log(
    "[next-cache] Production build finished. Stop the running dev server if any, then run `npm run dev`."
  );
  return 0;
}

const command = process.argv[2] || "ensure-dev";

switch (command) {
  case "ensure-dev":
    process.exit(ensureDev());
    break;
  case "check":
    process.exit(check());
    break;
  case "clean":
    cleanCache("Manual cache clean requested.");
    process.exit(0);
    break;
  case "note-production":
    process.exit(noteProduction());
    break;
  default:
    console.error(
      `[next-cache] Unknown command: ${command}\n` +
        "Available: ensure-dev | check | clean | note-production"
    );
    process.exit(1);
}

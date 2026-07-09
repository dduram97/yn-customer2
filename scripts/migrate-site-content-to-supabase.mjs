#!/usr/bin/env node
/**
 * Migrates data/site-content.json (+ public/uploads media) to Supabase.
 *
 * Usage:
 *   1. Run supabase/schema.sql in Supabase SQL Editor
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm run migrate:supabase
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const CONTENT_PATH = path.join(ROOT, "data/site-content.json");
const UPLOADS_DIR = path.join(ROOT, "public/uploads");
const BUCKET = "uploads";
const ROW_ID = "main";

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function collectUploadPaths(value, paths = new Set()) {
  if (typeof value === "string") {
    if (value.startsWith("/uploads/")) paths.add(value);
    return paths;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectUploadPaths(item, paths));
    return paths;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectUploadPaths(item, paths));
  }
  return paths;
}

function replaceUploadUrls(value, urlMap) {
  if (typeof value === "string") {
    return urlMap.get(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceUploadUrls(item, urlMap));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceUploadUrls(item, urlMap),
      ])
    );
  }
  return value;
}

function guessContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".m4v": "video/mp4",
    ".ogg": "video/ogg",
  };
  return map[ext] ?? "application/octet-stream";
}

async function main() {
  loadEnvFile();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  if (!fs.existsSync(CONTENT_PATH)) {
    console.error(`Content file not found: ${CONTENT_PATH}`);
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const raw = fs.readFileSync(CONTENT_PATH, "utf8");
  let content = JSON.parse(raw);
  const uploadPaths = [...collectUploadPaths(content)];
  const urlMap = new Map();

  console.log(`Found ${uploadPaths.length} local upload reference(s).`);

  for (const uploadPath of uploadPaths) {
    const filename = uploadPath.replace("/uploads/", "");
    const localPath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(localPath)) {
      console.warn(`Skip missing file: ${localPath}`);
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const objectPath = `migrated/${filename}`;

    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
      contentType: guessContentType(filename),
      upsert: true,
    });

    if (error) {
      console.error(`Upload failed for ${filename}:`, error.message);
      process.exit(1);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    urlMap.set(uploadPath, data.publicUrl);
    console.log(`Uploaded ${filename} -> ${data.publicUrl}`);
  }

  if (urlMap.size > 0) {
    content = replaceUploadUrls(content, urlMap);
  }

  const { error: saveError } = await supabase.from("site_content").upsert(
    {
      id: ROW_ID,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (saveError) {
    console.error("Failed to save site content:", saveError.message);
    process.exit(1);
  }

  fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2), "utf8");
  console.log("Migration complete. site_content row saved and JSON URLs updated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

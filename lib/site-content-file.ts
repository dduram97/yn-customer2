import { promises as fs } from "fs";
import path from "path";
import type { SiteContent } from "@/lib/types";

export const CONTENT_PATH = path.join(process.cwd(), "data/site-content.json");

export async function ensureContentFile(defaultContent: SiteContent): Promise<void> {
  try {
    await fs.access(CONTENT_PATH);
  } catch {
    await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
    await fs.writeFile(
      CONTENT_PATH,
      JSON.stringify(defaultContent, null, 2),
      "utf-8"
    );
  }
}

export async function readSiteContentFile(): Promise<SiteContent | null> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    return JSON.parse(raw) as SiteContent;
  } catch {
    return null;
  }
}

export async function writeSiteContentFile(content: SiteContent): Promise<void> {
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
  await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), "utf-8");
}

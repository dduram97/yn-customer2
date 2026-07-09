import type { GuideContentBlock } from "@/lib/types";

export type GuidePreviewKind = "eating" | "storage";

export interface GuidePreviewPayload {
  kind: GuidePreviewKind;
  slug: string;
  name: string;
  imageUrl?: string;
  blocks: GuideContentBlock[];
}

function storageKey(kind: GuidePreviewKind, slug: string): string {
  return `yn-guide-preview:${kind}:${slug}`;
}

export function writeGuidePreview(payload: GuidePreviewPayload): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(payload.kind, payload.slug), JSON.stringify(payload));
}

export function readGuidePreview(
  kind: GuidePreviewKind,
  slug: string
): GuidePreviewPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(storageKey(kind, slug));
    if (!raw) return null;
    return JSON.parse(raw) as GuidePreviewPayload;
  } catch {
    return null;
  }
}

export function openGuidePreview(path: string, payload: GuidePreviewPayload): void {
  writeGuidePreview(payload);
  window.open(`${path}?preview=true`, "_blank", "noopener,noreferrer");
}

import { hasMeaningfulCustomBlocks, hasMeaningfulCustomSteps } from "@/lib/guide-content";
import { stripHtml } from "@/lib/rich-text";
import type { EatingGuide, ProductPreview, StorageGuide } from "@/lib/types";

export type GuideContentStatus = "complete" | "needs-content";

function hasText(value?: string): boolean {
  return Boolean(value?.trim());
}

function findEatingGuideIndex(
  guides: EatingGuide[],
  preview: ProductPreview
): number {
  return guides.findIndex((guide) => guide.id === preview.id);
}

function findStorageGuideIndex(
  guides: StorageGuide[],
  preview: ProductPreview
): number {
  return guides.findIndex((guide) => guide.id === preview.id);
}

export function resolveEatingGuideForPreview(
  guides: EatingGuide[],
  preview: ProductPreview
): EatingGuide | undefined {
  const index = findEatingGuideIndex(guides, preview);
  return index >= 0 ? guides[index] : undefined;
}

export function resolveStorageGuideForPreview(
  guides: StorageGuide[],
  preview: ProductPreview
): StorageGuide | undefined {
  const index = findStorageGuideIndex(guides, preview);
  return index >= 0 ? guides[index] : undefined;
}

export function createEmptyEatingGuide(preview: ProductPreview): EatingGuide {
  return {
    id: preview.id,
    name: preview.name,
    emoji: "🐟",
    summary: "",
    preparation: "",
    thawing: "",
    recommendedPairing: [],
    eatingOrder: [],
    eatingMethod: "",
    isVisible: true,
  };
}

export function createEmptyStorageGuide(preview: ProductPreview): StorageGuide {
  return {
    id: preview.id,
    name: preview.name,
    emoji: "🐟",
    summary: "",
    storageMethod: "",
    temperature: "",
    recommendedTemp: "",
    shelfLife: "",
    thawingMethod: "",
    cautions: [],
    isVisible: true,
  };
}

export function upsertEatingGuide(
  guides: EatingGuide[],
  preview: ProductPreview,
  patch: Partial<EatingGuide>
): EatingGuide[] {
  const next = [...guides];
  const index = findEatingGuideIndex(next, preview);

  if (index >= 0) {
    next[index] = { ...next[index], ...patch, id: preview.id, name: preview.name };
    return next;
  }

  next.push({ ...createEmptyEatingGuide(preview), ...patch, id: preview.id, name: preview.name });
  return next;
}

export function upsertStorageGuide(
  guides: StorageGuide[],
  preview: ProductPreview,
  patch: Partial<StorageGuide>
): StorageGuide[] {
  const next = [...guides];
  const index = findStorageGuideIndex(next, preview);

  if (index >= 0) {
    next[index] = { ...next[index], ...patch, id: preview.id, name: preview.name };
    return next;
  }

  next.push({ ...createEmptyStorageGuide(preview), ...patch, id: preview.id, name: preview.name });
  return next;
}

export function hasEatingGuideContent(guide?: EatingGuide): boolean {
  if (!guide) return false;

  const blocksHaveContent = guide.blocks?.some((block) => {
    if (block.type === "heading") return Boolean(block.title.trim());
    if (block.type === "text") {
      return Boolean(block.title.trim() || stripHtml(block.content ?? ""));
    }
    if (block.type === "media") return Boolean(block.url);
    if (block.type === "title") return Boolean(block.text.trim());
    return false;
  });

  return (
    Boolean(blocksHaveContent) ||
    hasMeaningfulCustomBlocks(guide.blocks) ||
    hasText(guide.summary) ||
    hasText(guide.preparation) ||
    hasText(guide.thawing) ||
    hasText(guide.eatingMethod) ||
    guide.eatingOrder.some((item) => item.trim()) ||
    guide.recommendedPairing.some((item) => item.trim()) ||
    hasMeaningfulCustomSteps(guide.steps)
  );
}

export function hasStorageGuideContent(guide?: StorageGuide): boolean {
  if (!guide) return false;

  const blocksHaveContent = guide.blocks?.some((block) => {
    if (block.type === "heading") return Boolean(block.title.trim());
    if (block.type === "text") {
      return Boolean(block.title.trim() || stripHtml(block.content ?? ""));
    }
    if (block.type === "media") return Boolean(block.url);
    if (block.type === "title") return Boolean(block.text.trim());
    return false;
  });

  return (
    Boolean(blocksHaveContent) ||
    hasMeaningfulCustomBlocks(guide.blocks) ||
    hasText(guide.summary) ||
    hasText(guide.storageMethod) ||
    hasText(guide.temperature) ||
    hasText(guide.recommendedTemp) ||
    hasText(guide.shelfLife) ||
    hasText(guide.thawingMethod) ||
    guide.cautions.some((item) => item.trim()) ||
    hasMeaningfulCustomSteps(guide.steps)
  );
}

export function getEatingGuideContentStatus(
  guides: EatingGuide[],
  preview: ProductPreview
): GuideContentStatus {
  const guide = resolveEatingGuideForPreview(guides, preview);
  return hasEatingGuideContent(guide) ? "complete" : "needs-content";
}

export function getStorageGuideContentStatus(
  guides: StorageGuide[],
  preview: ProductPreview
): GuideContentStatus {
  const guide = resolveStorageGuideForPreview(guides, preview);
  return hasStorageGuideContent(guide) ? "complete" : "needs-content";
}

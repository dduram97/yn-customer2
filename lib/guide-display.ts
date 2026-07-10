import type {
  GuideContentBlock,
  ProductPreview,
  StorageGuide,
} from "@/lib/types";
import { resolveStorageGuideForPreview } from "@/lib/guide-admin";

export function resolveGuidePageTitle(
  blocks: GuideContentBlock[],
  fallback: string
): string {
  const heading = blocks.find((block) => block.type === "heading");
  if (heading && heading.type === "heading" && heading.title.trim()) {
    return heading.title;
  }
  return fallback;
}

export function resolveGuideContentBlocks(
  blocks: GuideContentBlock[]
): GuideContentBlock[] {
  return blocks.filter((block) => block.type !== "heading");
}

export function resolveGuideThumbnail(guide?: { imageUrl?: string }): string | undefined {
  return guide?.imageUrl?.trim() || undefined;
}

/**
 * /guide/storage list card image:
 * 1) storageGuides matched by preview.id (slug) → imageUrl
 * 2) else productPreviews.imageUrl
 * 3) else undefined (SeafoodListCard / ImagePlaceholder empty state)
 */
export function resolveStorageListCardImage(
  preview: ProductPreview,
  storageGuides: StorageGuide[]
): string | undefined {
  const guide = resolveStorageGuideForPreview(storageGuides, preview);
  const hero = guide?.imageUrl?.trim();
  if (hero) return hero;

  const fallback = preview.imageUrl?.trim();
  return fallback || undefined;
}

import type {
  GuideContentBlock,
  ProductPreview,
  StorageGuide,
} from "@/lib/types";
import { resolveStorageGuideForPreview } from "@/lib/guide-admin";
import { isStillImageMedia } from "@/lib/media";

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
 * /guide/storage list card image (still images only — no GIF/MOV/video):
 * 1) productPreviews.imageUrl when it is a still image
 * 2) else storageGuides.imageUrl when it is a still image
 * 3) else undefined → SeafoodListCard / ImagePlaceholder empty state
 */
export function resolveStorageListCardImage(
  preview: ProductPreview,
  storageGuides: StorageGuide[]
): string | undefined {
  const card = preview.imageUrl?.trim();
  if (card && isStillImageMedia(card)) return card;

  const guide = resolveStorageGuideForPreview(storageGuides, preview);
  const hero = guide?.imageUrl?.trim();
  if (hero && isStillImageMedia(hero)) return hero;

  return undefined;
}

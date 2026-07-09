import {
  resolveEatingGuideForPreview,
  resolveStorageGuideForPreview,
} from "@/lib/guide-admin";
import type { EatingGuide, ProductPreview, StorageGuide } from "@/lib/types";

export function isGuidePublished(guide?: EatingGuide | StorageGuide): boolean {
  if (!guide) return true;
  return guide.isVisible !== false;
}

export function filterVisibleHandlingPreviews(
  previews: ProductPreview[],
  guides: EatingGuide[]
): ProductPreview[] {
  return previews.filter((preview) =>
    isGuidePublished(resolveEatingGuideForPreview(guides, preview))
  );
}

export function filterVisibleStoragePreviews(
  previews: ProductPreview[],
  guides: StorageGuide[]
): ProductPreview[] {
  return previews.filter((preview) =>
    isGuidePublished(resolveStorageGuideForPreview(guides, preview))
  );
}

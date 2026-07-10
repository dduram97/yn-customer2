import type { EatingGuide, ProductPreview, StorageGuide } from "@/lib/types";

function cloneGuide<T extends EatingGuide | StorageGuide>(
  guide: T,
  id: string,
  name: string
): T {
  return {
    ...(JSON.parse(JSON.stringify(guide)) as T),
    id,
    name,
  };
}

function findLegacyEatingGuide(
  guides: EatingGuide[],
  preview: ProductPreview
): EatingGuide | undefined {
  if (preview.anchorId) {
    const byAnchor = guides.find((guide) => guide.id === preview.anchorId);
    if (byAnchor) return byAnchor;
  }

  return guides.find((guide) => guide.name === preview.name);
}

function findLegacyStorageGuide(
  guides: StorageGuide[],
  preview: ProductPreview
): StorageGuide | undefined {
  if (preview.anchorId) {
    const byAnchor = guides.find((guide) => guide.id === preview.anchorId);
    if (byAnchor) return byAnchor;
  }

  return guides.find((guide) => guide.name === preview.name);
}

/** Each handling preview gets its own eating guide keyed by preview.id. */
export function ensureEatingGuidesForPreviews(
  previews: ProductPreview[],
  guides: EatingGuide[]
): EatingGuide[] {
  const next = [...guides];

  for (const preview of previews) {
    if (next.some((guide) => guide.id === preview.id)) continue;

    const legacy = findLegacyEatingGuide(next, preview);
    if (legacy) {
      next.push(cloneGuide(legacy, preview.id, preview.name));
    }
  }

  return next;
}

/** Each storage preview gets its own storage guide keyed by preview.id. */
export function ensureStorageGuidesForPreviews(
  previews: ProductPreview[],
  guides: StorageGuide[]
): StorageGuide[] {
  const next = [...guides];

  for (const preview of previews) {
    if (next.some((guide) => guide.id === preview.id)) continue;

    const legacy = findLegacyStorageGuide(next, preview);
    if (legacy) {
      next.push(cloneGuide(legacy, preview.id, preview.name));
    }
  }

  return next;
}

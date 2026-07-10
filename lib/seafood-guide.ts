import {
  getVisibleHomeHandlingPreviews,
  getVisibleHomeStoragePreviews,
} from "@/lib/home-card-sync";
import type {
  EatingGuide,
  ProductPreview,
  SiteContent,
  StorageGuide,
} from "@/lib/types";

export type SeafoodGuideKind = "storage" | "cleaning";

/** Customer links and guide keys use each preview's unique id. */
export function resolveSeafoodSlug(preview: ProductPreview): string {
  return preview.id;
}

export function getSeafoodGuidePath(
  slug: string,
  kind: SeafoodGuideKind
): string {
  return `/seafood/${slug}/${kind}`;
}

export function findStoragePreviewBySlug(
  content: SiteContent,
  slug: string
): ProductPreview | undefined {
  return content.productPreviews.find(
    (preview) => preview.id === slug || preview.anchorId === slug
  );
}

export function findHandlingPreviewBySlug(
  content: SiteContent,
  slug: string
): ProductPreview | undefined {
  return content.handlingPreviews.find(
    (preview) => preview.id === slug || preview.anchorId === slug
  );
}

export function findStorageGuideBySlug(
  content: SiteContent,
  slug: string
): StorageGuide | undefined {
  const direct = content.storageGuides.find((guide) => guide.id === slug);
  if (direct) return direct;

  const preview = findStoragePreviewBySlug(content, slug);
  if (!preview) return undefined;

  return content.storageGuides.find((guide) => guide.id === preview.id);
}

export function findEatingGuideBySlug(
  content: SiteContent,
  slug: string
): EatingGuide | undefined {
  const direct = content.eatingGuides.find((guide) => guide.id === slug);
  if (direct) return direct;

  const preview = findHandlingPreviewBySlug(content, slug);
  if (!preview) return undefined;

  return content.eatingGuides.find((guide) => guide.id === preview.id);
}

/** @deprecated Use getVisibleHomeStoragePreviews from home-card-sync */
export function getStorageListItems(content: SiteContent): ProductPreview[] {
  return getVisibleHomeStoragePreviews(content);
}

/** @deprecated Use getVisibleHomeHandlingPreviews from home-card-sync */
export function getCleaningListItems(content: SiteContent): ProductPreview[] {
  return getVisibleHomeHandlingPreviews(content);
}

export function getRelatedSeafoodGuidePath(
  content: SiteContent,
  slug: string,
  currentKind: SeafoodGuideKind
): { href: string; label: string } | null {
  const storageGuide = findStorageGuideBySlug(content, slug);
  const eatingGuide = findEatingGuideBySlug(content, slug);
  const storagePreview = findStoragePreviewBySlug(content, slug);
  const handlingPreview = findHandlingPreviewBySlug(content, slug);
  const name =
    storageGuide?.name ??
    eatingGuide?.name ??
    storagePreview?.name ??
    handlingPreview?.name ??
    "수산물";

  if (currentKind === "storage" && eatingGuide) {
    return {
      href: getSeafoodGuidePath(slug, "cleaning"),
      label: `${name} 손질법 보기`,
    };
  }

  if (currentKind === "cleaning" && storageGuide) {
    return {
      href: getSeafoodGuidePath(slug, "storage"),
      label: `${name} 보관법 보기`,
    };
  }

  return null;
}

export function getSeafoodPageTitle(
  pathname: string,
  kind?: SeafoodGuideKind
): string | null {
  const match = pathname.match(/^\/seafood\/[^/]+\/(storage|cleaning)$/);
  if (!match) return null;

  const resolvedKind = (kind ?? match[1]) as SeafoodGuideKind;
  return resolvedKind === "storage" ? "보관방법" : "손질법";
}

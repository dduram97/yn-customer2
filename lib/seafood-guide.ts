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

export interface RelatedSeafoodGuideLink {
  label: string;
  /** Present when the paired guide exists and can be opened. */
  href?: string;
  /** True when the pair is missing — show "준비중" modal instead of navigating. */
  pending?: boolean;
}

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

function normalizeSeafoodName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

export function findStoragePreviewBySlug(
  content: SiteContent,
  slug: string
): ProductPreview | undefined {
  const byId = content.productPreviews.find((preview) => preview.id === slug);
  if (byId) return byId;
  return content.productPreviews.find((preview) => preview.anchorId === slug);
}

export function findHandlingPreviewBySlug(
  content: SiteContent,
  slug: string
): ProductPreview | undefined {
  const byId = content.handlingPreviews.find((preview) => preview.id === slug);
  if (byId) return byId;
  return content.handlingPreviews.find((preview) => preview.anchorId === slug);
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

function resolveCurrentSeafoodName(
  content: SiteContent,
  slug: string,
  currentKind: SeafoodGuideKind
): string {
  if (currentKind === "cleaning") {
    return (
      findEatingGuideBySlug(content, slug)?.name ??
      findHandlingPreviewBySlug(content, slug)?.name ??
      "수산물"
    );
  }

  return (
    findStorageGuideBySlug(content, slug)?.name ??
    findStoragePreviewBySlug(content, slug)?.name ??
    "수산물"
  );
}

function findStoragePairByName(
  content: SiteContent,
  name: string
): { slug: string; guide?: StorageGuide } | null {
  const normalized = normalizeSeafoodName(name);

  const preview = content.productPreviews.find(
    (item) => normalizeSeafoodName(item.name) === normalized
  );
  if (preview) {
    return {
      slug: preview.id,
      guide: findStorageGuideBySlug(content, preview.id),
    };
  }

  const guide = content.storageGuides.find(
    (item) => normalizeSeafoodName(item.name) === normalized
  );
  if (guide) {
    return { slug: guide.id, guide };
  }

  return null;
}

function findEatingPairByName(
  content: SiteContent,
  name: string
): { slug: string; guide?: EatingGuide } | null {
  const normalized = normalizeSeafoodName(name);

  const preview = content.handlingPreviews.find(
    (item) => normalizeSeafoodName(item.name) === normalized
  );
  if (preview) {
    return {
      slug: preview.id,
      guide: findEatingGuideBySlug(content, preview.id),
    };
  }

  const guide = content.eatingGuides.find(
    (item) => normalizeSeafoodName(item.name) === normalized
  );
  if (guide) {
    return { slug: guide.id, guide };
  }

  return null;
}

/**
 * Always returns a related 손질법↔보관법 action for the same seafood (matched by name).
 * When the pair is missing, `pending` is true so the UI can show a "준비중" modal.
 */
export function getRelatedSeafoodGuidePath(
  content: SiteContent,
  slug: string,
  currentKind: SeafoodGuideKind
): RelatedSeafoodGuideLink {
  const name = resolveCurrentSeafoodName(content, slug, currentKind);

  if (currentKind === "cleaning") {
    const label = `${name} 보관법 보기`;
    const pair = findStoragePairByName(content, name);
    if (pair?.guide) {
      return {
        href: getSeafoodGuidePath(pair.slug, "storage"),
        label,
      };
    }
    return { label, pending: true };
  }

  const label = `${name} 손질법 보기`;
  const pair = findEatingPairByName(content, name);
  if (pair?.guide) {
    return {
      href: getSeafoodGuidePath(pair.slug, "cleaning"),
      label,
    };
  }
  return { label, pending: true };
}

/** @deprecated Use getVisibleHomeStoragePreviews from home-card-sync */
export function getStorageListItems(content: SiteContent): ProductPreview[] {
  return getVisibleHomeStoragePreviews(content);
}

/** @deprecated Use getVisibleHomeHandlingPreviews from home-card-sync */
export function getCleaningListItems(content: SiteContent): ProductPreview[] {
  return getVisibleHomeHandlingPreviews(content);
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

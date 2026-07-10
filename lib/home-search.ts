import {
  resolveEatingGuideForPreview,
  resolveStorageGuideForPreview,
} from "@/lib/guide-admin";
import { isGuidePublished } from "@/lib/guide-visibility";
import type {
  EatingGuide,
  FaqItem,
  ProductPreview,
  StorageGuide,
} from "@/lib/types";
import { getSeafoodGuidePath, resolveSeafoodSlug } from "@/lib/seafood-guide";

export type SearchResultCategory = "handling" | "storage" | "faq";

export interface SearchResult {
  id: string;
  category: SearchResultCategory;
  title: string;
  targetId: string;
  href?: string;
}

export interface HomeSearchContent {
  handlingPreviews: ProductPreview[];
  productPreviews: ProductPreview[];
  eatingGuides: EatingGuide[];
  storageGuides: StorageGuide[];
  faqItems: FaqItem[];
}

const CATEGORY_LABELS: Record<SearchResultCategory, string> = {
  handling: "손질법",
  storage: "보관법",
  faq: "자주 묻는 질문",
};

export function getSearchCategoryLabel(category: SearchResultCategory): string {
  return CATEGORY_LABELS[category];
}

export function getHandlingTargetId(preview: ProductPreview): string {
  return `search-handling-${preview.id}`;
}

export function getStorageTargetId(preview: ProductPreview): string {
  return `search-storage-${preview.id}`;
}

export function getFaqTargetId(item: FaqItem): string {
  return `search-faq-${item.id}`;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesQuery(query: string, ...texts: (string | undefined)[]): boolean {
  if (!query) return false;
  return texts.some((text) => text?.toLowerCase().includes(query));
}

function collectTexts(values: (string | string[] | undefined)[]): string[] {
  return values.flatMap((value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });
}

function findHandlingPreview(
  previews: ProductPreview[],
  guide: EatingGuide
): ProductPreview | undefined {
  return previews.find(
    (preview) => preview.id === guide.id || preview.name === guide.name
  );
}

function findStoragePreview(
  previews: ProductPreview[],
  guide: StorageGuide
): ProductPreview | undefined {
  return previews.find(
    (preview) => preview.id === guide.id || preview.name === guide.name
  );
}

export function searchHomeContent(
  content: HomeSearchContent,
  rawQuery: string
): SearchResult[] {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  const addResult = (result: SearchResult) => {
    const key = `${result.category}:${result.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(result);
  };

  for (const preview of content.handlingPreviews) {
    const guide = resolveEatingGuideForPreview(content.eatingGuides, preview);
    if (!isGuidePublished(guide)) continue;
    if (!matchesQuery(query, preview.name, preview.imageLabel)) continue;

    addResult({
      id: `handling-preview-${preview.id}`,
      category: "handling",
      title: `${preview.name} 손질법`,
      targetId: getHandlingTargetId(preview),
      href: getSeafoodGuidePath(resolveSeafoodSlug(preview), "cleaning"),
    });
  }

  for (const guide of content.eatingGuides) {
    if (!isGuidePublished(guide)) continue;
    const fields = collectTexts([
      guide.name,
      guide.summary,
      guide.preparation,
      guide.thawing,
      guide.eatingMethod,
      guide.recommendedPairing,
      guide.eatingOrder,
    ]);

    if (!matchesQuery(query, ...fields)) continue;

    const preview = findHandlingPreview(content.handlingPreviews, guide);
    if (preview) {
      addResult({
        id: `handling-guide-${guide.id}`,
        category: "handling",
        title: `${guide.name} 손질법`,
        targetId: getHandlingTargetId(preview),
        href: getSeafoodGuidePath(resolveSeafoodSlug(preview), "cleaning"),
      });
      continue;
    }

    addResult({
      id: `handling-guide-page-${guide.id}`,
      category: "handling",
      title: `${guide.name} 손질법`,
      targetId: guide.id,
      href: getSeafoodGuidePath(guide.id, "cleaning"),
    });
  }

  for (const preview of content.productPreviews) {
    const guide = resolveStorageGuideForPreview(content.storageGuides, preview);
    if (!isGuidePublished(guide)) continue;
    if (!matchesQuery(query, preview.name, preview.imageLabel)) continue;

    addResult({
      id: `storage-preview-${preview.id}`,
      category: "storage",
      title: `${preview.name} 보관법`,
      targetId: getStorageTargetId(preview),
      href: getSeafoodGuidePath(resolveSeafoodSlug(preview), "storage"),
    });
  }

  for (const guide of content.storageGuides) {
    if (!isGuidePublished(guide)) continue;
    const fields = collectTexts([
      guide.name,
      guide.summary,
      guide.storageMethod,
      guide.temperature,
      guide.recommendedTemp,
      guide.shelfLife,
      guide.thawingMethod,
      guide.cautions,
    ]);

    if (!matchesQuery(query, ...fields)) continue;

    const preview = findStoragePreview(content.productPreviews, guide);
    if (preview) {
      addResult({
        id: `storage-guide-${guide.id}`,
        category: "storage",
        title: `${preview.name} 보관법`,
        targetId: getStorageTargetId(preview),
        href: getSeafoodGuidePath(resolveSeafoodSlug(preview), "storage"),
      });
      continue;
    }

    addResult({
      id: `storage-guide-page-${guide.id}`,
      category: "storage",
      title: `${guide.name} 보관법`,
      targetId: guide.id,
      href: getSeafoodGuidePath(guide.id, "storage"),
    });
  }

  for (const item of content.faqItems) {
    if (!matchesQuery(query, item.question, item.answer)) continue;

    const targetId = getFaqTargetId(item);
    addResult({
      id: `faq-${item.id}`,
      category: "faq",
      title: item.question,
      targetId,
      href: `/faq#${targetId}`,
    });
  }

  const categoryOrder: SearchResultCategory[] = ["handling", "storage", "faq"];
  return results.sort(
    (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  );
}

export function groupSearchResults(results: SearchResult[]) {
  const groups: { category: SearchResultCategory; items: SearchResult[] }[] = [];

  for (const category of ["handling", "storage", "faq"] as SearchResultCategory[]) {
    const items = results.filter((result) => result.category === category);
    if (items.length > 0) {
      groups.push({ category, items });
    }
  }

  return groups;
}

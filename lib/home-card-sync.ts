import {
  getEatingGuideContentStatus,
  getStorageGuideContentStatus,
  resolveEatingGuideForPreview,
  resolveStorageGuideForPreview,
  type GuideContentStatus,
} from "@/lib/guide-admin";
import {
  filterVisibleHandlingPreviews,
  filterVisibleStoragePreviews,
} from "@/lib/guide-visibility";
import type { EatingGuide, ProductPreview, SiteContent, StorageGuide } from "@/lib/types";

/**
 * 고객 홈 "수산물 손질법" 카드뉴스 — 손질법 관리 목록의 기준 데이터(source of truth).
 * 순서·개수·이름은 handlingPreviews 배열을 그대로 따릅니다.
 */
export function getHomeHandlingCardNews(
  content: Pick<SiteContent, "handlingPreviews">
): ProductPreview[] {
  return content.handlingPreviews;
}

/**
 * 고객 홈 "수산물 보관법" 카드뉴스 — 보관법 관리 목록의 기준 데이터(source of truth).
 * 순서·개수·이름은 productPreviews 배열을 그대로 따릅니다.
 */
export function getHomeStorageCardNews(
  content: Pick<SiteContent, "productPreviews">
): ProductPreview[] {
  return content.productPreviews;
}

/**
 * 홈 손질법 카드뉴스 + /guide/how-to-eat 목록 공통 데이터.
 * handlingPreviews 순서를 따르고, 숨김(isVisible=false) 항목은 제외합니다.
 */
export function getVisibleHomeHandlingPreviews(
  content: Pick<SiteContent, "handlingPreviews" | "eatingGuides">
): ProductPreview[] {
  return filterVisibleHandlingPreviews(
    getHomeHandlingCardNews(content),
    content.eatingGuides
  );
}

/**
 * 홈 보관법 카드뉴스 + /guide/storage 목록 공통 데이터.
 * productPreviews 순서를 따르고, 숨김(isVisible=false) 항목은 제외합니다.
 */
export function getVisibleHomeStoragePreviews(
  content: Pick<SiteContent, "productPreviews" | "storageGuides">
): ProductPreview[] {
  return filterVisibleStoragePreviews(
    getHomeStorageCardNews(content),
    content.storageGuides
  );
}

export interface SyncedEatingAdminItem {
  preview: ProductPreview;
  guide?: EatingGuide;
  status: GuideContentStatus;
  order: number;
}

export interface SyncedStorageAdminItem {
  preview: ProductPreview;
  guide?: StorageGuide;
  status: GuideContentStatus;
  order: number;
}

export interface SyncedAdminListSummary {
  total: number;
  complete: number;
  needsContent: number;
}

/** 홈 손질법 카드뉴스 순서대로 관리자 손질법 목록을 생성합니다. */
export function buildSyncedEatingAdminList(
  content: Pick<SiteContent, "handlingPreviews" | "eatingGuides">
): SyncedEatingAdminItem[] {
  return getHomeHandlingCardNews(content).map((preview, order) => ({
    preview,
    guide: resolveEatingGuideForPreview(content.eatingGuides, preview),
    status: getEatingGuideContentStatus(content.eatingGuides, preview),
    order,
  }));
}

/** 홈 보관법 카드뉴스 순서대로 관리자 보관법 목록을 생성합니다. */
export function buildSyncedStorageAdminList(
  content: Pick<SiteContent, "productPreviews" | "storageGuides">
): SyncedStorageAdminItem[] {
  return getHomeStorageCardNews(content).map((preview, order) => ({
    preview,
    guide: resolveStorageGuideForPreview(content.storageGuides, preview),
    status: getStorageGuideContentStatus(content.storageGuides, preview),
    order,
  }));
}

export function summarizeSyncedAdminList(
  items: Array<{ status: GuideContentStatus }>
): SyncedAdminListSummary {
  const complete = items.filter((item) => item.status === "complete").length;

  return {
    total: items.length,
    complete,
    needsContent: items.length - complete,
  };
}

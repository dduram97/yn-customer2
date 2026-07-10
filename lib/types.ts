import type { HomeSectionId } from "@/lib/home-section-order";

export type { HomeSectionId };

export type DeliveryStep =
  | "preparing"
  | "picked_up"
  | "in_transit"
  | "delivered";

export interface TrackingData {
  productName: string;
  courier: string;
  trackingNumber: string;
  status: string;
  location: string;
  step: DeliveryStep;
}

export interface TrackingApiResponse {
  success: boolean;
  data?: TrackingData;
  error?: string;
}

export interface GuideItem {
  id: string;
  name: string;
  emoji: string;
  summary: string;
  /** 상세 페이지 대표 이미지 (홈 카드 이미지와 분리) */
  imageUrl?: string;
  /** 대표 영상이면 재생 시 무음 처리 */
  heroMuted?: boolean;
  /** false면 홈·검색·목록에서 숨김. 미설정 시 공개 */
  isVisible?: boolean;
  mediaItems?: GuideMediaItem[];
  steps?: GuideStep[];
  blocks?: GuideContentBlock[];
}

export type GuideMediaType = "image" | "gif" | "video";

export interface GuideTextStyle {
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  highlight?: boolean;
  color?: string;
  textAlign?: "left" | "center" | "right";
}

export interface GuideMediaItem {
  id: string;
  type: GuideMediaType;
  label: string;
  url?: string;
}

export interface GuideHeadingBlock {
  id: string;
  type: "heading";
  title: string;
  style?: GuideTextStyle;
}

export interface GuideTextBlock {
  id: string;
  type: "text";
  title: string;
  content: string;
  titleStyle?: GuideTextStyle;
  style?: GuideTextStyle;
}

export interface GuideMediaBlock {
  id: string;
  type: "media";
  mediaType: GuideMediaType;
  url?: string;
  label?: string;
}

/** @deprecated Migrated to GuideHeadingBlock on read. */
export interface GuideLegacyTitleBlock {
  id: string;
  type: "title";
  text: string;
}

export type GuideContentBlock =
  | GuideHeadingBlock
  | GuideTextBlock
  | GuideMediaBlock
  | GuideLegacyTitleBlock;

export type GuideTemplateKind = "eating" | "storage";

export interface GuideTemplateBlockDef {
  type: "heading" | "text";
  title: string;
}

export interface GuideTemplate {
  id: string;
  name: string;
  kind: GuideTemplateKind;
  blocks: GuideTemplateBlockDef[];
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  media?: GuideMediaItem[];
  /** @deprecated Use step.media instead. Kept for backward-compatible reads. */
  mediaUrl?: string;
  /** @deprecated Use step.media instead. Kept for backward-compatible reads. */
  mediaType?: GuideMediaType;
}

export interface StorageGuide extends GuideItem {
  storageMethod: string;
  temperature: string;
  recommendedTemp: string;
  shelfLife: string;
  thawingMethod: string;
  cautions: string[];
}

export interface EatingGuide extends GuideItem {
  preparation: string;
  thawing: string;
  recommendedPairing: string[];
  eatingOrder: string[];
  eatingMethod: string;
}

export interface ContactInfo {
  phone: string;
  kakaoUrl: string;
  address: string;
  businessHours: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface HomeSection {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  imageLabel: string;
}

export interface QuickNavItem {
  label: string;
  href: string;
  icon: "intro" | "tracking" | "storage" | "eating" | "faq";
}

export interface HeroSlide {
  id: string;
  title: string;
  imageLabel: string;
  imageUrl?: string;
}

export interface ProductPreview {
  id: string;
  name: string;
  imageLabel: string;
  anchorId?: string;
  imageUrl?: string;
}

export interface SitePageContent {
  brandHeaderSubtitle: string;
  contactHeroLabel: string;
  storageHeroLabel: string;
  howToEatHeroLabel: string;
  faqFooterTitle: string;
  faqFooterText: string;
}

export interface SitePageImages {
  contactHero?: string;
  storageHero?: string;
  howToEatHero?: string;
}

export interface SiteConfig {
  name: string;
  brandName: string;
  tagline: string;
  description: string;
}

export interface SiteContent {
  siteConfig: SiteConfig;
  contactInfo: ContactInfo;
  heroSlides: HeroSlide[];
  productPreviews: ProductPreview[];
  handlingPreviews: ProductPreview[];
  storageGuides: StorageGuide[];
  eatingGuides: EatingGuide[];
  eatingGuideTemplates?: GuideTemplate[];
  storageGuideTemplates?: GuideTemplate[];
  faqItems: FaqItem[];
  quickNavItems: QuickNavItem[];
  homeSectionOrder: HomeSectionId[];
  pageContent: SitePageContent;
  pageImages: SitePageImages;
}

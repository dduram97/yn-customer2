import {
  ensureEatingGuidesForPreviews,
  ensureStorageGuidesForPreviews,
} from "@/lib/guide-preview-sync";
import {
  getDefaultEatingGuideTemplates,
  getDefaultStorageGuideTemplates,
} from "@/lib/guide-templates";
import { DEFAULT_HOME_SECTION_ORDER, normalizeHomeSectionOrder } from "@/lib/home-section-order";
import { normalizeMultilineText } from "@/lib/multiline-text";
import { normalizeQuickNavItems } from "@/lib/quick-nav";
import {
  loadSiteContentFromStore,
  persistSiteContentToStore,
} from "@/lib/site-content-store";
import type { SiteContent } from "@/lib/types";

export const DEFAULT_SITE_CONTENT: SiteContent = {
  siteConfig: {
    name: "영남수산",
    brandName: "포항 영남수산 | 오름과메기",
    tagline: "포항 죽도시장 수산물 전문점",
    description:
      "영남수산 고객 서비스 - 배송조회, 보관방법, 맛있게 먹는 법 안내",
  },
  contactInfo: {
    phone: "0507-1351-9511",
    kakaoUrl: "http://pf.kakao.com/_wQXIX",
    address: "경상북도 포항시 북구 죽도시장",
    businessHours: "연중무휴 06:00 ~ 18:00",
    description:
      "포항 죽도시장에서 30년 이상 신선한 수산물을 직접 선별하여 판매하고 있습니다. 과메기, 문어, 전복 등 제철 수산물을 정성껏 준비해 드립니다.",
  },
  heroSlides: [
    { id: "seasonal", title: "제철 수산물", imageLabel: "제철 수산물" },
    { id: "gwamegi", title: "", imageLabel: "과메기" },
    { id: "fresh", title: "", imageLabel: "포항 수산물" },
  ],
  productPreviews: [
    { id: "octopus", name: "참문어", imageLabel: "참문어" },
    { id: "abalone", name: "전복", imageLabel: "전복" },
    { id: "semi-dried", name: "반건조 생선", imageLabel: "반건조 생선" },
    { id: "gwamegi", name: "과메기", imageLabel: "과메기" },
  ],
  handlingPreviews: [
    { id: "octopus", name: "게종류", imageLabel: "게종류" },
    { id: "abalone", name: "생선", imageLabel: "생선" },
    { id: "semi-dried", name: "반건조 생선", imageLabel: "반건조 생선" },
    { id: "gwamegi", name: "과메기", imageLabel: "과메기" },
    {
      id: "handling-octopus",
      name: "참문어",
      imageLabel: "참문어",
      anchorId: "octopus",
    },
    {
      id: "handling-abalone",
      name: "전복",
      imageLabel: "전복",
      anchorId: "abalone",
    },
    { id: "eel", name: "장어", imageLabel: "장어" },
  ],
  storageGuides: [
    {
      id: "gwamegi",
      name: "과메기",
      emoji: "🐟",
      summary: "냉동 보관 후 천천히 해동하여 드세요",
      storageMethod: "밀봉 후 냉동 보관",
      temperature: "냉동",
      recommendedTemp: "-18°C 이하",
      shelfLife: "냉동 3개월",
      thawingMethod: "냉장실에서 12~24시간 천천히 해동",
      cautions: [
        "해동 후 재냉동 금지",
        "직사광선 피해 보관",
        "해동 후 당일 섭취 권장",
      ],
    },
    {
      id: "octopus",
      name: "참문어",
      emoji: "🐙",
      summary: "살아있는 상태에서 냉장 보관하거나 냉동 보관",
      storageMethod: "비닐에 밀봉 후 냉장 또는 냉동",
      temperature: "냉장/냉동",
      recommendedTemp: "냉장 0~4°C / 냉동 -18°C",
      shelfLife: "냉장 2~3일 / 냉동 1개월",
      thawingMethod: "냉장실에서 6~8시간 해동",
      cautions: [
        "해동 시 실온 해동 금지",
        "냄새가 이상하면 섭취 금지",
        "조리 전 충분히 씻어 사용",
      ],
    },
    {
      id: "semi-dried",
      name: "반건조 생선",
      emoji: "🐠",
      summary: "통풍이 잘 되는 곳에 냉장 보관",
      storageMethod: "밀폐 용기에 넣어 냉장 보관",
      temperature: "냉장",
      recommendedTemp: "0~4°C",
      shelfLife: "냉장 5~7일",
      thawingMethod: "냉장 보관 상태 그대로 사용",
      cautions: [
        "습기가 많은 곳 피하기",
        "표면이 끈적해지면 섭취 금지",
        "개봉 후 빠른 섭취 권장",
      ],
    },
    {
      id: "abalone",
      name: "전복",
      emoji: "🦪",
      summary: "살아있는 전복은 습한 천으로 덮어 냉장 보관",
      storageMethod: "젖은 천으로 덮어 냉장 보관",
      temperature: "냉장",
      recommendedTemp: "0~4°C",
      shelfLife: "냉장 2~3일",
      thawingMethod: "냉동 전복은 냉장실에서 8시간 해동",
      cautions: [
        "물에 담가두지 않기",
        "껍데기가 열리면 신선도 저하",
        "조리 전 솔로 껍데기 닦기",
      ],
    },
  ],
  eatingGuides: [
    {
      id: "gwamegi",
      name: "과메기",
      emoji: "🐟",
      summary: "쌈과 함께 한 입에 드시면 최고의 맛",
      preparation: "해동 후 내장 제거, 물기 제거",
      thawing: "냉장실에서 12~24시간 천천히 해동",
      recommendedPairing: ["마늘", "쪽파", "고추장", "쌈채소", "쌈장"],
      eatingOrder: [
        "쌈채소에 과메기 올리기",
        "마늘, 쪽파 추가",
        "쌈장 또는 고추장 살짝",
        "한 입에 싸서 드시기",
      ],
      eatingMethod:
        "쌈에 싸 먹거나 밥 위에 올려 비빔밥으로 즐기세요. 기름기가 풍부해 밥과 함께 드시면 더욱 맛있습니다.",
    },
    {
      id: "octopus",
      name: "참문어",
      emoji: "🐙",
      summary: "삶거나 숙회로 즐기는 포항의 별미",
      preparation: "소금으로 문질러 미끈거림 제거, 내장 제거",
      thawing: "냉장실에서 6~8시간 해동",
      recommendedPairing: ["초고추장", "마늘", "참기름", "깻잎"],
      eatingOrder: [
        "깨끗이 씻어 삶기 (30~40분)",
        "식힌 후 먹기 좋은 크기로 자르기",
        "초고추장에 찍어 먹기",
      ],
      eatingMethod:
        "삶은 문어는 초고추장에 찍어 먹거나, 참기름과 소금에 찍어 드세요. 숙회로 드실 때는 신선한 상태에서 얇게 썰어 드시면 됩니다.",
    },
    {
      id: "semi-dried",
      name: "반건조 생선",
      emoji: "🐠",
      summary: "구이로 드시면 고소한 맛이 일품",
      preparation: "흐르는 물에 가볍게 씻기",
      thawing: "냉장 보관 상태 그대로 사용",
      recommendedPairing: ["레몬", "마늘", "버터", "와사비"],
      eatingOrder: [
        "팬에 기름 두르고 앞뒤로 구워주기",
        "겉이 노릇해질 때까지 익히기",
        "레몬 즙 뿌려 드시기",
      ],
      eatingMethod:
        "팬에 구워 드시거나 에어프라이어에 180°C에서 10분간 구워 드세요. 겉은 바삭하고 속은 촉촉한 것이 포인트입니다.",
    },
    {
      id: "abalone",
      name: "전복",
      emoji: "🦪",
      summary: "버터 구이로 고소한 맛을 즐기세요",
      preparation: "솔로 껍데기와 이빨 제거, 내장 제거",
      thawing: "냉동 전복은 냉장실에서 8시간 해동",
      recommendedPairing: ["버터", "마늘", "와사비", "간장"],
      eatingOrder: [
        "전복을 십자로 칼집 내기",
        "버터와 마늘로 앞뒤 구워주기",
        "간장 또는 와사비에 찍어 드시기",
      ],
      eatingMethod:
        "버터에 마늘을 볶다가 전복을 넣고 앞뒤로 구워 드세요. 쫄깃한 식감이 살아있을 때가 가장 맛있습니다.",
    },
  ],
  faqItems: [
    {
      id: "delivery-time",
      question: "배송은 며칠 걸리나요?",
      answer:
        "주문 후 1~2일 내 출고되며, 택배 배송은 보통 1~2일 추가 소요됩니다. 제철 수산물 특성상 날씨나 물량에 따라 1~2일 지연될 수 있습니다.",
    },
    {
      id: "tracking",
      question: "배송조회는 어떻게 하나요?",
      answer:
        "주문 후 카카오톡 알림톡으로 발송되는 배송조회 버튼을 누르시면 됩니다. 운송장번호를 직접 입력하실 필요가 없습니다.",
    },
    {
      id: "storage",
      question: "과메기는 어떻게 보관하나요?",
      answer:
        "밀봉 후 냉동 보관해 주세요. 드실 때는 냉장실에서 12~24시간 천천히 해동하시고, 해동 후 재냉동은 피해 주세요.",
    },
    {
      id: "reorder",
      question: "재주문은 어떻게 하나요?",
      answer:
        "전화 주문 또는 카카오톡 채널로 문의해 주시면 됩니다. 문의하기 페이지에서 바로 연결하실 수 있습니다.",
    },
    {
      id: "refund",
      question: "상품에 문제가 있으면 어떻게 하나요?",
      answer:
        "수령 후 24시간 이내에 사진과 함께 카카오톡 또는 전화로 연락해 주세요. 신선식품 특성상 빠른 연락이 중요합니다.",
    },
  ],
  quickNavItems: [
    { label: "소개", href: "/contact", icon: "intro" },
    { label: "손질법", href: "/#home-handling", icon: "eating" },
    { label: "보관법", href: "/#home-storage", icon: "storage" },
    { label: "자주묻는 질문", href: "/faq", icon: "faq" },
  ],
  homeSectionOrder: [...DEFAULT_HOME_SECTION_ORDER],
  pageContent: {
    brandHeaderSubtitle: "고객 페이지",
    contactHeroLabel: "영남수산 매장 이미지",
    storageHeroLabel: "보관법 대표 이미지",
    howToEatHeroLabel: "드시는 법 대표 이미지",
    faqFooterTitle: "원하는 답변을 찾지 못하셨나요?",
    faqFooterText: "하단 문의 버튼을 눌러주세요.",
  },
  pageImages: {},
};

export function normalizeSiteContent(content: SiteContent): SiteContent {
  const eatingGuides = ensureEatingGuidesForPreviews(
    content.handlingPreviews,
    content.eatingGuides
  );
  const storageGuides = ensureStorageGuidesForPreviews(
    content.productPreviews,
    content.storageGuides
  );

  return {
    ...content,
    eatingGuides,
    storageGuides,
    contactInfo: {
      ...content.contactInfo,
      description: normalizeMultilineText(content.contactInfo.description),
    },
    faqItems: content.faqItems.map((item) => ({
      ...item,
      answer: normalizeMultilineText(item.answer),
    })),
    homeSectionOrder: normalizeHomeSectionOrder(content.homeSectionOrder),
    quickNavItems: normalizeQuickNavItems(content.quickNavItems ?? []),
    eatingGuideTemplates:
      content.eatingGuideTemplates ?? getDefaultEatingGuideTemplates(),
    storageGuideTemplates:
      content.storageGuideTemplates ?? getDefaultStorageGuideTemplates(),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  return loadSiteContentFromStore(DEFAULT_SITE_CONTENT, normalizeSiteContent);
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await persistSiteContentToStore(content, normalizeSiteContent);
}

export const HOME_SECTION_IDS = [
  "quickNav",
  "hero",
  "handling",
  "storage",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  quickNav: "빠른 메뉴",
  hero: "홈 배너",
  handling: "수산물 손질법",
  storage: "수산물 보관법",
};

export const DEFAULT_HOME_SECTION_ORDER: HomeSectionId[] = [...HOME_SECTION_IDS];

export function normalizeHomeSectionOrder(
  order?: HomeSectionId[]
): HomeSectionId[] {
  if (!order?.length) return [...DEFAULT_HOME_SECTION_ORDER];

  const valid = order.filter((id): id is HomeSectionId =>
    HOME_SECTION_IDS.includes(id)
  );
  const missing = DEFAULT_HOME_SECTION_ORDER.filter((id) => !valid.includes(id));

  return [...valid, ...missing];
}

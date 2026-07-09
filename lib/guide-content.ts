import {
  hasRenderableGuideBlocks,
  normalizeGuideBlocks,
  resolveCustomerGuideBlocks,
  type GuideEditorKind,
} from "@/lib/guide-blocks";
import type {
  EatingGuide,
  GuideMediaItem,
  GuideMediaType,
  GuideStep,
  StorageGuide,
} from "@/lib/types";

export {
  hasRenderableGuideBlocks as hasMeaningfulCustomBlocks,
  normalizeGuideBlocks,
  resolveCustomerGuideBlocks as resolveGuideDisplayBlocks,
};

export type { GuideEditorKind };

export function normalizeStepMedia(step: GuideStep): GuideMediaItem[] {
  if (step.media?.length) {
    return step.media;
  }

  if (step.mediaUrl) {
    const inferMediaType = (url: string): GuideMediaType => {
      if (url.toLowerCase().endsWith(".gif")) return "gif";
      if (/\.(mp4|webm|mov|m4v|ogg)$/i.test(url)) return "video";
      return "image";
    };

    return [
      {
        id: `${step.id}-legacy-media`,
        type: inferMediaType(step.mediaUrl),
        label: step.title,
        url: step.mediaUrl,
      },
    ];
  }

  return [];
}

export function normalizeGuideStep(step: GuideStep): GuideStep {
  return {
    ...step,
    media: normalizeStepMedia(step),
  };
}

function stepHasMeaningfulContent(step: GuideStep): boolean {
  const media = normalizeStepMedia(step);
  return Boolean(
    step.title.trim() ||
      step.description.trim() ||
      media.some((item) => item.url)
  );
}

export function hasMeaningfulCustomSteps(steps?: GuideStep[]): boolean {
  return Boolean(steps?.some(stepHasMeaningfulContent));
}

export function buildLegacyStorageSteps(guide: StorageGuide): GuideStep[] {
  return [
    {
      id: `${guide.id}-legacy-storage-method`,
      title: "보관 방법",
      description: [
        `보관 방법: ${guide.storageMethod}`,
        `냉장/냉동: ${guide.temperature}`,
        `권장 온도: ${guide.recommendedTemp}`,
      ].join("\n"),
      media: [],
    },
    {
      id: `${guide.id}-legacy-storage-life`,
      title: "보관 기간 및 해동",
      description: [`보관 기간: ${guide.shelfLife}`, `해동 방법: ${guide.thawingMethod}`].join(
        "\n"
      ),
      media: [],
    },
    {
      id: `${guide.id}-legacy-storage-cautions`,
      title: "주의사항",
      description: guide.cautions.map((caution) => `· ${caution}`).join("\n"),
      media: [],
    },
  ];
}

export function buildLegacyEatingSteps(guide: EatingGuide): GuideStep[] {
  return guide.eatingOrder.map((text, index) => ({
    id: `${guide.id}-legacy-eating-${index}`,
    title: `단계 ${index + 1}`,
    description: text,
    media: [],
  }));
}

export function resolveStorageDisplaySteps(guide: StorageGuide): GuideStep[] {
  if (hasRenderableGuideBlocks(guide.blocks)) {
    return [];
  }

  if (hasMeaningfulCustomSteps(guide.steps)) {
    return guide.steps!.map(normalizeGuideStep);
  }

  return [];
}

export function resolveEatingDisplaySteps(guide: EatingGuide): GuideStep[] {
  if (hasRenderableGuideBlocks(guide.blocks)) {
    return [];
  }

  if (hasMeaningfulCustomSteps(guide.steps)) {
    return guide.steps!.map(normalizeGuideStep);
  }

  return [];
}

export function resolveStorageDescription(guide: StorageGuide): string {
  if (hasRenderableGuideBlocks(guide.blocks)) return "";
  if (hasMeaningfulCustomSteps(guide.steps)) return guide.summary;
  return "";
}

export function resolveEatingDescription(guide: EatingGuide): string {
  if (hasRenderableGuideBlocks(guide.blocks)) return "";
  if (!hasMeaningfulCustomSteps(guide.steps)) return "";

  const parts = [
    guide.summary,
    guide.preparation ? `손질 방법: ${guide.preparation}` : "",
    guide.thawing ? `해동 방법: ${guide.thawing}` : "",
    guide.eatingMethod ? `먹는 방법: ${guide.eatingMethod}` : "",
    guide.recommendedPairing.length > 0
      ? `추천 조합: ${guide.recommendedPairing.join(", ")}`
      : "",
  ].filter(Boolean);

  return parts.join("\n\n");
}

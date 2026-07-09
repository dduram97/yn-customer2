import { inferMediaTypeFromUrl } from "@/lib/media";
import { linesToListHtml, plainTextToHtml } from "@/lib/rich-text";
import type {
  EatingGuide,
  GuideContentBlock,
  GuideHeadingBlock,
  GuideMediaBlock,
  GuideTextBlock,
  StorageGuide,
} from "@/lib/types";

export type GuideEditorKind = "eating" | "storage";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeMediaBlock(block: GuideMediaBlock): GuideMediaBlock {
  if (!block.url) return block;

  return {
    ...block,
    mediaType: inferMediaTypeFromUrl(block.url, block.mediaType),
  };
}

export function normalizeGuideBlock(block: GuideContentBlock): GuideContentBlock {
  if (block.type === "media") {
    return normalizeMediaBlock(block);
  }

  if (block.type === "heading") {
    return {
      ...block,
      title: block.title ?? "",
      style: block.style ?? {},
    };
  }

  if (block.type === "text") {
    const legacyText = "text" in block ? (block as { text?: string }).text : undefined;

    return {
      id: block.id,
      type: "text",
      title: block.title ?? "내용",
      content: block.content ?? plainTextToHtml(legacyText ?? ""),
      titleStyle: block.titleStyle ?? {},
      style: block.style ?? {},
    };
  }

  if (block.type === "title") {
    const legacy = block as { id: string; type: "title"; text: string };
    return {
      id: legacy.id,
      type: "heading",
      title: legacy.text ?? "",
      style: {},
    };
  }

  return block;
}

export function normalizeGuideBlocks(blocks: GuideContentBlock[]): GuideContentBlock[] {
  return blocks.map((block) => normalizeGuideBlock(block));
}

function blockHasRenderableContent(block: GuideContentBlock): boolean {
  if (block.type === "heading") return Boolean(block.title.trim());
  if (block.type === "text") {
    return Boolean(block.title.trim() || stripContent(block.content));
  }
  if (block.type === "media") return Boolean(block.url);
  return false;
}

function stripContent(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
}

export function hasRenderableGuideBlocks(blocks?: GuideContentBlock[]): boolean {
  return Boolean(blocks?.some(blockHasRenderableContent));
}

export function createDefaultEatingBlocks(
  guide: EatingGuide,
  seafoodName: string
): GuideContentBlock[] {
  return [
    {
      id: "heading",
      type: "heading",
      title: `${seafoodName} 손질법`,
      style: { fontSize: "2xl", fontWeight: "bold" },
    },
    {
      id: "block-prep-info",
      type: "text",
      title: "손질정보",
      content: plainTextToHtml(guide.summary),
      style: {},
    },
    {
      id: "block-preparation",
      type: "text",
      title: "손질방법",
      content: plainTextToHtml(guide.preparation),
      style: {},
    },
    {
      id: "block-thawing",
      type: "text",
      title: "해동방법",
      content: plainTextToHtml(guide.thawing),
      style: {},
    },
    {
      id: "block-eating",
      type: "text",
      title: "먹는방법",
      content: plainTextToHtml(guide.eatingMethod),
      style: {},
    },
    {
      id: "block-order",
      type: "text",
      title: "맛있게 먹는 순서",
      content: linesToListHtml(guide.eatingOrder),
      style: {},
    },
    {
      id: "block-pairing",
      type: "text",
      title: "추천조합",
      content: plainTextToHtml(guide.recommendedPairing.join(", ")),
      style: {},
    },
  ];
}

export function createDefaultStorageBlocks(
  guide: StorageGuide,
  seafoodName: string
): GuideContentBlock[] {
  return [
    {
      id: "heading",
      type: "heading",
      title: `${seafoodName} 보관법`,
      style: { fontSize: "2xl", fontWeight: "bold" },
    },
    {
      id: "block-storage-info",
      type: "text",
      title: "보관정보",
      content: plainTextToHtml(guide.summary),
      style: {},
    },
    {
      id: "block-storage-method",
      type: "text",
      title: "보관방법",
      content: plainTextToHtml(guide.storageMethod),
      style: {},
    },
    {
      id: "block-storage-temp",
      type: "text",
      title: "보관온도",
      content: plainTextToHtml(
        [guide.temperature, guide.recommendedTemp].filter(Boolean).join(" · ")
      ),
      style: {},
    },
    {
      id: "block-storage-life",
      type: "text",
      title: "보관기간",
      content: plainTextToHtml(guide.shelfLife),
      style: {},
    },
    {
      id: "block-thawing",
      type: "text",
      title: "해동방법",
      content: plainTextToHtml(guide.thawingMethod),
      style: {},
    },
    {
      id: "block-cautions",
      type: "text",
      title: "주의사항",
      content: linesToListHtml(guide.cautions),
      style: {},
    },
  ];
}

export function ensureHeadingBlock(
  blocks: GuideContentBlock[],
  fallbackTitle: string
): GuideContentBlock[] {
  if (blocks.some((block) => block.type === "heading")) {
    return blocks;
  }

  return [
    {
      id: "heading",
      type: "heading",
      title: fallbackTitle,
      style: { fontSize: "2xl", fontWeight: "bold" },
    },
    ...blocks,
  ];
}

export function resolveEditorBlocks(
  guide: EatingGuide | StorageGuide,
  kind: GuideEditorKind,
  seafoodName: string
): GuideContentBlock[] {
  const fallbackTitle = `${seafoodName} ${kind === "eating" ? "손질법" : "보관법"}`;

  if (guide.blocks?.length) {
    return ensureHeadingBlock(normalizeGuideBlocks(guide.blocks), fallbackTitle);
  }

  return kind === "eating"
    ? createDefaultEatingBlocks(guide as EatingGuide, seafoodName)
    : createDefaultStorageBlocks(guide as StorageGuide, seafoodName);
}

export function resolveCustomerGuideBlocks(
  guide: EatingGuide | StorageGuide,
  kind: GuideEditorKind,
  seafoodName: string
): GuideContentBlock[] {
  if (hasRenderableGuideBlocks(guide.blocks)) {
    return normalizeGuideBlocks(guide.blocks!);
  }

  return resolveEditorBlocks(guide, kind, seafoodName);
}

export function moveGuideBlocks(
  blocks: GuideContentBlock[],
  from: number,
  to: number
): GuideContentBlock[] {
  if (to < 0 || to >= blocks.length || from === to) return blocks;
  const next = [...blocks];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function createTextBlock(): GuideTextBlock {
  return {
    id: createId("text"),
    type: "text",
    title: "새 텍스트",
    content: "",
    style: {},
  };
}

export function createMediaBlock(): GuideMediaBlock {
  return {
    id: createId("media"),
    type: "media",
    mediaType: "image",
  };
}

export function isHeadingBlock(block: GuideContentBlock): block is GuideHeadingBlock {
  return block.type === "heading";
}

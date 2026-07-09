import type { GuideContentBlock, GuideTemplate, GuideTemplateBlockDef } from "@/lib/types";

export const SEAFOOD_PLACEHOLDER = "{seafood}";

function createTemplateId() {
  return `template-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createBlockId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getDefaultEatingGuideTemplates(): GuideTemplate[] {
  return [
    {
      id: "default-eating",
      name: "기본 손질법",
      kind: "eating",
      blocks: [
        { type: "heading", title: `${SEAFOOD_PLACEHOLDER} 손질법` },
        { type: "text", title: "손질정보" },
        { type: "text", title: "손질방법" },
        { type: "text", title: "해동방법" },
        { type: "text", title: "먹는방법" },
        { type: "text", title: "맛있게 먹는 순서" },
        { type: "text", title: "추천조합" },
      ],
    },
  ];
}

export function getDefaultStorageGuideTemplates(): GuideTemplate[] {
  return [
    {
      id: "default-storage",
      name: "기본 보관법",
      kind: "storage",
      blocks: [
        { type: "heading", title: `${SEAFOOD_PLACEHOLDER} 보관법` },
        { type: "text", title: "보관정보" },
        { type: "text", title: "보관방법" },
        { type: "text", title: "보관온도" },
        { type: "text", title: "보관기간" },
        { type: "text", title: "해동방법" },
        { type: "text", title: "주의사항" },
      ],
    },
  ];
}

export function resolveGuideTemplates(
  templates: GuideTemplate[] | undefined,
  kind: GuideTemplate["kind"]
): GuideTemplate[] {
  const defaults =
    kind === "eating"
      ? getDefaultEatingGuideTemplates()
      : getDefaultStorageGuideTemplates();

  if (!templates?.length) return defaults;
  return templates.filter((template) => template.kind === kind);
}

export function createGuideTemplate(kind: GuideTemplate["kind"]): GuideTemplate {
  const suffix = kind === "eating" ? "손질법" : "보관법";

  return {
    id: createTemplateId(),
    name: `새 ${suffix} 템플릿`,
    kind,
    blocks: [
      { type: "heading", title: `${SEAFOOD_PLACEHOLDER} ${suffix}` },
      { type: "text", title: "새 섹션" },
    ],
  };
}

export function applySeafoodNameToTitle(title: string, seafoodName: string): string {
  return title.replaceAll(SEAFOOD_PLACEHOLDER, seafoodName);
}

export function instantiateGuideTemplate(
  template: GuideTemplate,
  seafoodName: string
): GuideContentBlock[] {
  return template.blocks.map((blockDef, index) => {
    const title = applySeafoodNameToTitle(blockDef.title, seafoodName);

    if (blockDef.type === "heading") {
      return {
        id: "heading",
        type: "heading",
        title,
      };
    }

    return {
      id: createBlockId(`block-${index}`),
      type: "text",
      title,
      content: "",
    };
  });
}

export function extractTemplateBlocksFromGuide(
  blocks: GuideContentBlock[],
  seafoodName: string
): GuideTemplateBlockDef[] {
  return blocks
    .filter((block) => block.type === "heading" || block.type === "text")
    .map((block) => {
      if (block.type === "heading") {
        let title = block.title;
        if (seafoodName && title.includes(seafoodName)) {
          title = title.replaceAll(seafoodName, SEAFOOD_PLACEHOLDER);
        }
        return { type: "heading" as const, title };
      }

      return { type: "text" as const, title: block.title };
    });
}

export function moveTemplateBlocks(
  blocks: GuideTemplateBlockDef[],
  from: number,
  to: number
): GuideTemplateBlockDef[] {
  if (to < 0 || to >= blocks.length || from === to) return blocks;
  const next = [...blocks];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

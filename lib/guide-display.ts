import type { GuideContentBlock } from "@/lib/types";

export function resolveGuidePageTitle(
  blocks: GuideContentBlock[],
  fallback: string
): string {
  const heading = blocks.find((block) => block.type === "heading");
  if (heading && heading.type === "heading" && heading.title.trim()) {
    return heading.title;
  }
  return fallback;
}

export function resolveGuideContentBlocks(
  blocks: GuideContentBlock[]
): GuideContentBlock[] {
  return blocks.filter((block) => block.type !== "heading");
}

export function resolveGuideThumbnail(guide?: { imageUrl?: string }): string | undefined {
  return guide?.imageUrl?.trim() || undefined;
}

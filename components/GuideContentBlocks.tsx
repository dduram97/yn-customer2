import GuideMediaBlock from "@/components/GuideMediaBlock";
import { styleToClassName, styleToInlineStyle } from "@/lib/guide-block-styles";
import type { GuideContentBlock } from "@/lib/types";

interface GuideContentBlocksProps {
  blocks: GuideContentBlock[];
}

function hasDisplayContent(html: string): boolean {
  return Boolean(html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim());
}

export default function GuideContentBlocks({ blocks }: GuideContentBlocksProps) {
  return (
    <section className="space-y-6" aria-label="콘텐츠 블록">
      {blocks.map((block) => {
        if (block.type === "heading" && block.title.trim()) {
          return (
            <h2
              key={block.id}
              className={`text-2xl font-bold leading-tight text-black ${styleToClassName(block.style)}`}
              style={styleToInlineStyle(block.style)}
            >
              {block.title}
            </h2>
          );
        }

        if (block.type === "text") {
          const showTitle = Boolean(block.title.trim());
          const showContent = hasDisplayContent(block.content);

          if (!showTitle && !showContent) return null;

          return (
            <article key={block.id} className="space-y-3">
              {showTitle ? (
                <h3 className="font-bold text-black">
                  {block.title}
                </h3>
              ) : null}
              {showContent ? (
                <div
                  className="guide-rich-content leading-relaxed text-body"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              ) : null}
            </article>
          );
        }

        if (block.type === "media" && block.url) {
          return (
            <GuideMediaBlock
              key={block.id}
              media={{
                url: block.url,
                mediaType: block.mediaType,
                label: block.label,
              }}
            />
          );
        }

        return null;
      })}
    </section>
  );
}

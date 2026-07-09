import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import GuideContentBlocks from "@/components/GuideContentBlocks";
import GuideMediaBlock from "@/components/GuideMediaBlock";
import { normalizeStepMedia } from "@/lib/guide-content";
import type { GuideContentBlock, GuideStep } from "@/lib/types";

interface SeafoodGuideDetailProps {
  name: string;
  pageTitle: string;
  heroImageUrl?: string;
  description: string;
  blocks?: GuideContentBlock[];
  steps: GuideStep[];
  relatedLink?: {
    href: string;
    label: string;
  } | null;
}

export default function SeafoodGuideDetail({
  name,
  pageTitle,
  heroImageUrl,
  description,
  blocks = [],
  steps,
  relatedLink,
}: SeafoodGuideDetailProps) {
  const useBlockLayout = blocks.length > 0;
  const title = pageTitle.trim() || name;

  return (
    <div className="space-y-8 pb-4">
      <h1 className="text-[24px] font-bold leading-tight text-black">{title}</h1>

      {heroImageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <ImagePlaceholder
            label={name}
            src={heroImageUrl}
            aspectRatio="section"
            className="border-0"
          />
        </div>
      ) : null}

      {!useBlockLayout && description ? (
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-body">
          {description}
        </p>
      ) : null}

      {useBlockLayout ? <GuideContentBlocks blocks={blocks} /> : null}

      {!useBlockLayout && steps.length > 0 ? (
        <section className="space-y-6" aria-label="단계별 설명">
          {steps.map((step, index) => {
            const media = normalizeStepMedia(step);

            return (
              <article
                key={step.id}
                className="space-y-4 rounded-2xl border border-border bg-surface px-4 py-4"
              >
                <h2 className="text-[16px] font-bold text-black">
                  STEP {index + 1}
                  {step.title ? ` · ${step.title}` : ""}
                </h2>

                {media.length > 0 ? (
                  <div className="space-y-3">
                    {media.map((item) =>
                      item.url ? (
                        <GuideMediaBlock
                          key={item.id}
                          media={{
                            url: item.url,
                            mediaType: item.type,
                            label: item.label,
                          }}
                        />
                      ) : null
                    )}
                  </div>
                ) : null}

                {step.description ? (
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-body">
                    {step.description}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      {relatedLink ? (
        <div className="pt-2">
          <Link
            href={relatedLink.href}
            className="flex w-full items-center justify-center rounded-2xl border border-border bg-white px-4 py-4 text-[16px] font-bold text-black transition-colors active:bg-surface"
          >
            {relatedLink.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

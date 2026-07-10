"use client";

import Link from "next/link";
import { useState } from "react";
import MediaPlaceholder from "@/components/MediaPlaceholder";
import GuideContentBlocks from "@/components/GuideContentBlocks";
import GuideMediaBlock from "@/components/GuideMediaBlock";
import { normalizeStepMedia } from "@/lib/guide-content";
import type { GuideContentBlock, GuideStep } from "@/lib/types";

export interface RelatedGuideLink {
  label: string;
  href?: string;
  pending?: boolean;
}

interface SeafoodGuideDetailProps {
  name: string;
  pageTitle: string;
  heroImageUrl?: string;
  heroMuted?: boolean;
  description: string;
  blocks?: GuideContentBlock[];
  steps: GuideStep[];
  relatedLink?: RelatedGuideLink | null;
}

function ComingSoonModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white px-6 py-8 text-center shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[28px]" aria-hidden>
          ⚙️
        </p>
        <h2
          id="coming-soon-title"
          className="mt-3 text-[17px] font-bold text-black"
        >
          해당 콘텐츠는 준비중입니다.
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-body">
          곧 업데이트 예정입니다.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl border border-border bg-black px-4 py-3 text-[15px] font-bold text-white active:opacity-80"
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default function SeafoodGuideDetail({
  name,
  pageTitle,
  heroImageUrl,
  heroMuted = false,
  description,
  blocks = [],
  steps,
  relatedLink,
}: SeafoodGuideDetailProps) {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const useBlockLayout = blocks.length > 0;
  const title = pageTitle.trim() || name;

  return (
    <div className="space-y-8 pb-4">
      <h1 className="text-[24px] font-bold leading-tight text-black">{title}</h1>

      {heroImageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <MediaPlaceholder
            label={name}
            src={heroImageUrl}
            aspectRatio="section"
            className="border-0"
            muted={heroMuted}
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
          {relatedLink.pending || !relatedLink.href ? (
            <button
              type="button"
              onClick={() => setComingSoonOpen(true)}
              className="flex w-full items-center justify-center rounded-2xl border border-border bg-white px-4 py-4 text-[16px] font-bold text-black transition-colors active:bg-surface"
            >
              {relatedLink.label}
            </button>
          ) : (
            <Link
              href={relatedLink.href}
              className="flex w-full items-center justify-center rounded-2xl border border-border bg-white px-4 py-4 text-[16px] font-bold text-black transition-colors active:bg-surface"
            >
              {relatedLink.label}
            </Link>
          )}
        </div>
      ) : null}

      <ComingSoonModal
        open={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
      />
    </div>
  );
}

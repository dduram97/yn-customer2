"use client";

import { useEffect, useState } from "react";
import SeafoodGuideDetail from "@/components/SeafoodGuideDetail";
import {
  resolveGuideContentBlocks,
  resolveGuidePageTitle,
} from "@/lib/guide-display";
import { readGuidePreview } from "@/lib/guide-preview";
import type { GuideContentBlock, GuideStep } from "@/lib/types";

interface SeafoodGuidePageViewProps {
  kind: "eating" | "storage";
  slug: string;
  isPreview: boolean;
  name: string;
  description: string;
  blocks: GuideContentBlock[];
  steps: GuideStep[];
  heroImageUrl?: string;
  isHidden: boolean;
  relatedLink?: {
    href: string;
    label: string;
  } | null;
}

function HiddenGuideNotice({
  name,
  kind,
}: {
  name: string;
  kind: "eating" | "storage";
}) {
  const label = kind === "eating" ? "손질법" : "보관법";

  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-8 text-center">
      <p className="text-[16px] font-bold text-black">{name} {label}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-body">
        현재 이 콘텐츠는 준비 중입니다.
        <br />
        곧 업데이트될 예정입니다.
      </p>
    </div>
  );
}

function PreviewBanner() {
  return (
    <div className="rounded-xl border border-black/20 bg-black px-4 py-2 text-center text-[13px] font-medium text-white">
      관리자 미리보기 · 저장되지 않은 내용이 표시됩니다
    </div>
  );
}

export default function SeafoodGuidePageView({
  kind,
  slug,
  isPreview,
  name,
  description,
  blocks,
  steps,
  heroImageUrl,
  isHidden,
  relatedLink,
}: SeafoodGuidePageViewProps) {
  const [previewReady, setPreviewReady] = useState(!isPreview);
  const [previewBlocks, setPreviewBlocks] = useState<GuideContentBlock[] | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewHeroImageUrl, setPreviewHeroImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!isPreview) return;

    const payload = readGuidePreview(kind, slug);
    if (payload) {
      setPreviewBlocks(payload.blocks);
      setPreviewName(payload.name);
      setPreviewHeroImageUrl(payload.imageUrl);
    }
    setPreviewReady(true);
  }, [isPreview, kind, slug]);

  if (!previewReady) {
    return <p className="text-[15px] text-body">미리보기를 불러오는 중...</p>;
  }

  if (isHidden && !isPreview) {
    return <HiddenGuideNotice name={name} kind={kind} />;
  }

  const resolvedBlocks = previewBlocks ?? blocks;
  const resolvedName = previewName ?? name;
  const resolvedHeroImageUrl = isPreview ? previewHeroImageUrl : heroImageUrl;
  const pageTitle = resolveGuidePageTitle(resolvedBlocks, resolvedName);
  const contentBlocks = resolveGuideContentBlocks(resolvedBlocks);
  const useBlockLayout = contentBlocks.length > 0 || resolvedBlocks.length > 0;

  return (
    <div className="space-y-4">
      {isPreview ? <PreviewBanner /> : null}
      <SeafoodGuideDetail
        pageTitle={pageTitle}
        heroImageUrl={resolvedHeroImageUrl}
        description={description}
        blocks={useBlockLayout ? contentBlocks : []}
        steps={isPreview ? [] : steps}
        relatedLink={relatedLink}
        name={resolvedName}
      />
    </div>
  );
}

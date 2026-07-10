import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeafoodGuidePageView from "@/components/SeafoodGuidePageView";
import { getSiteContent } from "@/data/content";
import { resolveGuideThumbnail } from "@/lib/guide-display";
import {
  resolveEatingDescription,
  resolveEatingDisplaySteps,
  resolveGuideDisplayBlocks,
} from "@/lib/guide-content";
import { isGuidePublished } from "@/lib/guide-visibility";
import {
  findEatingGuideBySlug,
  findHandlingPreviewBySlug,
  getRelatedSeafoodGuidePath,
} from "@/lib/seafood-guide";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const guide = findEatingGuideBySlug(content, slug);
  const preview = findHandlingPreviewBySlug(content, slug);
  const name = guide?.name ?? preview?.name ?? "수산물";

  return {
    title: `${name} 손질법`,
    description: `${name} 손질 방법을 안내합니다`,
  };
}

export default async function SeafoodCleaningPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const content = await getSiteContent();
  const guide = findEatingGuideBySlug(content, slug);
  const handlingPreview = findHandlingPreviewBySlug(content, slug);

  if (!guide && !handlingPreview) {
    notFound();
  }

  const name = guide?.name ?? handlingPreview!.name;
  const relatedLink = getRelatedSeafoodGuidePath(content, slug, "cleaning");

  return (
    <SeafoodGuidePageView
      kind="eating"
      slug={slug}
      isPreview={isPreview}
      name={name}
      description={guide ? resolveEatingDescription(guide) : `${name} 손질법 안내`}
      blocks={guide ? resolveGuideDisplayBlocks(guide, "eating", name) : []}
      steps={guide ? resolveEatingDisplaySteps(guide) : []}
      heroImageUrl={resolveGuideThumbnail(guide)}
      isHidden={guide ? !isGuidePublished(guide) : false}
      relatedLink={relatedLink}
    />
  );
}

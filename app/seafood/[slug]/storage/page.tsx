import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeafoodGuidePageView from "@/components/SeafoodGuidePageView";
import { getSiteContent } from "@/data/content";
import { resolveGuideThumbnail } from "@/lib/guide-display";
import {
  resolveGuideDisplayBlocks,
  resolveStorageDescription,
  resolveStorageDisplaySteps,
} from "@/lib/guide-content";
import { isGuidePublished } from "@/lib/guide-visibility";
import {
  findStorageGuideBySlug,
  findStoragePreviewBySlug,
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
  const guide = findStorageGuideBySlug(content, slug);
  const preview = findStoragePreviewBySlug(content, slug);
  const name = guide?.name ?? preview?.name ?? "수산물";

  return {
    title: `${name} 보관법`,
    description: `${name} 보관 방법을 안내합니다`,
  };
}

export default async function SeafoodStoragePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const content = await getSiteContent();
  const guide = findStorageGuideBySlug(content, slug);
  const storagePreview = findStoragePreviewBySlug(content, slug);

  if (!guide && !storagePreview) {
    notFound();
  }

  const name = guide?.name ?? storagePreview!.name;
  const relatedLink = getRelatedSeafoodGuidePath(content, slug, "storage");

  return (
    <SeafoodGuidePageView
      kind="storage"
      slug={slug}
      isPreview={isPreview}
      name={name}
      description={guide ? resolveStorageDescription(guide) : `${name} 보관법 안내`}
      blocks={guide ? resolveGuideDisplayBlocks(guide, "storage", name) : []}
      steps={guide ? resolveStorageDisplaySteps(guide) : []}
      heroImageUrl={resolveGuideThumbnail(guide)}
      isHidden={guide ? !isGuidePublished(guide) : false}
      relatedLink={relatedLink}
    />
  );
}

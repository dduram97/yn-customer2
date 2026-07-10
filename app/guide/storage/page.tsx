import type { Metadata } from "next";
import SeafoodListCard from "@/components/SeafoodListCard";
import { getSiteContent } from "@/data/content";
import { resolveStorageListCardImage } from "@/lib/guide-display";
import { getVisibleHomeStoragePreviews } from "@/lib/home-card-sync";
import { getSeafoodGuidePath, resolveSeafoodSlug } from "@/lib/seafood-guide";

export const metadata: Metadata = {
  title: "보관방법",
  description: "수산물 보관 방법을 안내합니다",
};

export default async function StorageGuidePage() {
  const content = await getSiteContent();
  const items = getVisibleHomeStoragePreviews(content);

  return (
    <div className="space-y-3">
      {items.map((preview) => (
        <SeafoodListCard
          key={preview.id}
          name={preview.name}
          imageLabel={preview.imageLabel}
          imageUrl={resolveStorageListCardImage(preview, content.storageGuides)}
          subtitle="보관법"
          href={getSeafoodGuidePath(resolveSeafoodSlug(preview), "storage")}
        />
      ))}
    </div>
  );
}

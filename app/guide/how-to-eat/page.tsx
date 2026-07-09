import type { Metadata } from "next";
import SeafoodListCard from "@/components/SeafoodListCard";
import { getSiteContent } from "@/data/content";
import { getVisibleHomeHandlingPreviews } from "@/lib/home-card-sync";
import { getSeafoodGuidePath, resolveSeafoodSlug } from "@/lib/seafood-guide";

export const metadata: Metadata = {
  title: "손질법",
  description: "영남수산이 알려드리는 맛있게 먹는 방법",
};

export default async function HowToEatPage() {
  const content = await getSiteContent();
  const items = getVisibleHomeHandlingPreviews(content);

  return (
    <div className="space-y-3">
      {items.map((preview) => (
        <SeafoodListCard
          key={preview.id}
          name={preview.name}
          imageLabel={preview.imageLabel}
          imageUrl={preview.imageUrl}
          subtitle="손질법"
          href={getSeafoodGuidePath(resolveSeafoodSlug(preview), "cleaning")}
        />
      ))}
    </div>
  );
}

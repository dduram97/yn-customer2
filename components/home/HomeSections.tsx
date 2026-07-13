import QuickNav from "@/components/home/QuickNav";
import HeroCarousel from "@/components/home/HeroCarousel";
import HandlingScroll from "@/components/home/HandlingScroll";
import StorageScroll from "@/components/home/StorageScroll";
import HomeSearch from "@/components/home/HomeSearch";
import HomeFeaturedNews from "@/components/home/HomeFeaturedNews";
import { normalizeHomeSectionOrder } from "@/lib/home-section-order";
import {
  getVisibleHomeHandlingPreviews,
  getVisibleHomeStoragePreviews,
} from "@/lib/home-card-sync";
import type { CustomerNewsItem } from "@/lib/customer-news";
import type { SiteContent } from "@/lib/types";
import { Fragment } from "react";

interface HomeSectionsProps {
  content: SiteContent;
  featuredNews?: CustomerNewsItem | null;
}

export default function HomeSections({
  content,
  featuredNews = null,
}: HomeSectionsProps) {
  const order = normalizeHomeSectionOrder(content.homeSectionOrder);
  const visibleHandlingPreviews = getVisibleHomeHandlingPreviews(content);
  const visibleStoragePreviews = getVisibleHomeStoragePreviews(content);

  return (
    <div className="mt-6 space-y-6">
      {order.map((sectionId) => {
        switch (sectionId) {
          case "quickNav":
            return <QuickNav key={sectionId} items={content.quickNavItems} />;
          case "hero":
            return <HeroCarousel key={sectionId} slides={content.heroSlides} />;
          case "handling":
            return (
              <Fragment key={sectionId}>
                <HomeSearch
                  handlingPreviews={visibleHandlingPreviews}
                  productPreviews={visibleStoragePreviews}
                  eatingGuides={content.eatingGuides}
                  storageGuides={content.storageGuides}
                  faqItems={content.faqItems}
                />
                <HomeFeaturedNews item={featuredNews} />
                <HandlingScroll previews={visibleHandlingPreviews} />
              </Fragment>
            );
          case "storage":
            return (
              <StorageScroll key={sectionId} previews={visibleStoragePreviews} />
            );
        }
      })}
    </div>
  );
}

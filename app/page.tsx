import { getSiteContent } from "@/data/content";
import BrandHeader from "@/components/home/BrandHeader";
import HomeSections from "@/components/home/HomeSections";
import HashScrollHandler from "@/components/HashScrollHandler";
import { getHomeFeaturedCustomerNews } from "@/lib/customer-news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const content = await getSiteContent();
  let featuredNews: Awaited<
    ReturnType<typeof getHomeFeaturedCustomerNews>
  > = null;
  try {
    featuredNews = await getHomeFeaturedCustomerNews();
  } catch {
    featuredNews = null;
  }

  return (
    <div className="space-y-6">
      <HashScrollHandler />
      <BrandHeader
        brandName={content.siteConfig.brandName}
        subtitle={content.pageContent.brandHeaderSubtitle}
      />
      <HomeSections content={content} featuredNews={featuredNews} />
    </div>
  );
}

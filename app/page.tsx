import { getSiteContent } from "@/data/content";
import BrandHeader from "@/components/home/BrandHeader";
import HomeSections from "@/components/home/HomeSections";
import HashScrollHandler from "@/components/HashScrollHandler";

// Soft-navigating back from detail pages can reuse this cached segment.
export const revalidate = 60;

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <div className="space-y-6">
      <HashScrollHandler />
      <BrandHeader
        brandName={content.siteConfig.brandName}
        subtitle={content.pageContent.brandHeaderSubtitle}
      />
      <HomeSections content={content} />
    </div>
  );
}

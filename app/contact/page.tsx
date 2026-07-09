import type { Metadata } from "next";
import MediaPlaceholder from "@/components/MediaPlaceholder";
import MultilineText from "@/components/MultilineText";
import { getSiteContent } from "@/data/content";

export const metadata: Metadata = {
  title: "소개",
  description: "영남수산 소개 및 문의",
};

export default async function ContactPage() {
  const content = await getSiteContent();

  return (
    <div className="space-y-8">
      <div className="-mx-4">
        <MediaPlaceholder
          label={content.pageContent.contactHeroLabel}
          src={content.pageImages.contactHero}
          aspectRatio="hero"
          className="rounded-none border-x-0"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-[18px] font-bold text-black">
          {content.siteConfig.brandName} 소개
        </h2>
        <MultilineText text={content.contactInfo.description} />
      </div>

      <div className="divide-y divide-border border-t border-border">
        <InfoRow label="주소" value={content.contactInfo.address} />
        <InfoRow label="영업시간" value={content.contactInfo.businessHours} />
        <InfoRow label="전화번호" value={content.contactInfo.phone} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-[16px] text-black">{label}</span>
      <span className="text-right text-[16px] font-medium text-body">{value}</span>
    </div>
  );
}

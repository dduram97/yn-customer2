import { getSiteContent } from "@/data/content";
import FaqItem from "@/components/FaqItem";
import HashScrollHandler from "@/components/HashScrollHandler";
import { getFaqTargetId } from "@/lib/home-search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: "영남수산 고객 서비스 자주 묻는 질문",
};

export default async function FaqPage() {
  const content = await getSiteContent();

  return (
    <div className="space-y-2">
      <HashScrollHandler />
      {content.faqItems.map((item) => (
        <FaqItem
          key={item.id}
          id={getFaqTargetId(item)}
          question={item.question}
          answer={item.answer}
        />
      ))}

      <div className="border-t border-border pt-8">
        <p className="text-[16px] font-bold text-black">
          {content.pageContent.faqFooterTitle}
        </p>
        <p className="mt-2 text-[15px] text-body">{content.pageContent.faqFooterText}</p>
      </div>
    </div>
  );
}

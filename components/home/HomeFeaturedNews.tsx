import Link from "next/link";
import type { CustomerNewsItem } from "@/lib/customer-news";
import CustomerNewsMedia from "@/components/CustomerNewsMedia";
import SectionHeader from "@/components/home/SectionHeader";

interface HomeFeaturedNewsProps {
  item: CustomerNewsItem | null;
}

/** Single admin-selected news preview shown under the home search bar. */
export default function HomeFeaturedNews({ item }: HomeFeaturedNewsProps) {
  if (!item) return null;

  return (
    <section aria-label="홈 대표 소식" className="space-y-3">
      <SectionHeader title="공지사항" href="/notice" />
      <Link
        href={`/notice/${item.id}`}
        className="flex items-stretch overflow-hidden rounded-2xl border border-border bg-white shadow-sm active:opacity-90"
      >
        {item.mediaUrl ? (
          <div className="w-[88px] shrink-0 self-stretch">
            <CustomerNewsMedia
              url={item.mediaUrl}
              mediaType={item.mediaType}
              alt=""
              variant="thumb"
              className="h-full min-h-full w-full rounded-none"
            />
          </div>
        ) : (
          <div className="flex w-[88px] shrink-0 self-stretch items-center justify-center bg-placeholder text-[11px] text-body">
            소식
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2">
          <p className="text-[10px] text-body">{item.createdAt.slice(0, 10)}</p>
          <h2 className="line-clamp-1 text-[14px] font-bold leading-snug text-black">
            {item.title}
          </h2>
          {item.content ? (
            <p className="line-clamp-1 text-[12px] leading-snug text-body">
              {item.content}
            </p>
          ) : null}
          <span className="mt-0.5 text-[11px] font-medium text-body">
            자세히 보기 ›
          </span>
        </div>
      </Link>
    </section>
  );
}

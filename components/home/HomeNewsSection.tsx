import Link from "next/link";
import type { CustomerNewsItem } from "@/lib/customer-news";
import CustomerNewsMedia from "@/components/CustomerNewsMedia";

interface HomeNewsSectionProps {
  items: CustomerNewsItem[];
}

/** Compact news window for the customer home page. */
export default function HomeNewsSection({ items }: HomeNewsSectionProps) {
  if (items.length === 0) return null;

  return (
    <section aria-label="소식" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-black">소식</h2>
        <Link
          href="/notice"
          className="text-[13px] font-medium text-body active:opacity-70"
        >
          전체 보기 ›
        </Link>
      </div>

      <div className="space-y-3">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={`/notice/${item.id}`}
            className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-white shadow-sm active:opacity-90"
          >
            {item.mediaUrl ? (
              <div className="h-[88px] w-[88px] shrink-0">
                <CustomerNewsMedia
                  url={item.mediaUrl}
                  mediaType={item.mediaType}
                  alt=""
                  variant="thumb"
                />
              </div>
            ) : (
              <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center bg-placeholder text-[11px] text-body">
                소식
              </div>
            )}
            <div className="min-w-0 flex-1 py-3 pr-3">
              <p className="text-[11px] text-body">
                {item.createdAt.slice(0, 10)}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[15px] font-bold text-black">
                {item.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-body">
                {item.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

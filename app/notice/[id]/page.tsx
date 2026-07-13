import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveCustomerNewsById,
  getAdjacentActiveCustomerNews,
} from "@/lib/customer-news";
import CustomerNewsMedia from "@/components/CustomerNewsMedia";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NoticeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getActiveCustomerNewsById(id);
    if (!item) {
      return { title: "소식" };
    }
    return {
      title: item.title,
      description: item.content.slice(0, 120) || "영남수산 소식",
    };
  } catch {
    return { title: "소식" };
  }
}

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const { id } = await params;

  let item: Awaited<ReturnType<typeof getActiveCustomerNewsById>> = null;
  try {
    item = await getActiveCustomerNewsById(id);
  } catch {
    notFound();
  }

  if (!item) {
    notFound();
  }

  let adjacent: Awaited<ReturnType<typeof getAdjacentActiveCustomerNews>> = {
    prev: null,
    next: null,
  };
  try {
    adjacent = await getAdjacentActiveCustomerNews(item);
  } catch {
    adjacent = { prev: null, next: null };
  }

  return (
    <article className="space-y-5 pb-6">
      <div className="space-y-2">
        <p className="text-[12px] text-body">{item.createdAt.slice(0, 10)}</p>
        <h1 className="text-[22px] font-bold leading-snug text-black">
          {item.title}
        </h1>
      </div>

      {item.mediaUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <CustomerNewsMedia
            url={item.mediaUrl}
            mediaType={item.mediaType}
            alt={item.title}
            variant="hero"
          />
        </div>
      ) : null}

      {item.content ? (
        <p className="whitespace-pre-wrap text-[16px] leading-relaxed text-black">
          {item.content}
        </p>
      ) : null}

      <nav
        aria-label="소식 이동"
        className="space-y-2 border-t border-border pt-4"
      >
        {adjacent.next ? (
          <Link
            href={`/notice/${adjacent.next.id}`}
            className="flex items-start gap-3 rounded-xl border border-border bg-white px-3 py-3 active:opacity-80"
          >
            <span className="shrink-0 text-[12px] font-medium text-body">
              다음 소식
            </span>
            <span className="min-w-0 flex-1 line-clamp-2 text-[14px] font-medium text-black">
              {adjacent.next.title}
            </span>
          </Link>
        ) : null}

        {adjacent.prev ? (
          <Link
            href={`/notice/${adjacent.prev.id}`}
            className="flex items-start gap-3 rounded-xl border border-border bg-white px-3 py-3 active:opacity-80"
          >
            <span className="shrink-0 text-[12px] font-medium text-body">
              이전 소식
            </span>
            <span className="min-w-0 flex-1 line-clamp-2 text-[14px] font-medium text-black">
              {adjacent.prev.title}
            </span>
          </Link>
        ) : null}

        <Link
          href="/notice"
          className="block pt-1 text-center text-[13px] font-medium text-body active:opacity-70"
        >
          목록으로
        </Link>
      </nav>
    </article>
  );
}

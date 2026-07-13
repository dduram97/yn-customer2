import type { Metadata } from "next";
import Link from "next/link";
import {
  CUSTOMER_NEWS_PAGE_SIZE,
  listActiveCustomerNewsPage,
} from "@/lib/customer-news";
import CustomerNewsMedia from "@/components/CustomerNewsMedia";
import NoticePagination from "@/components/NoticePagination";

export const metadata: Metadata = {
  title: "공지사항",
  description: "영남수산 소식과 공지사항",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface NoticePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NoticePage({ searchParams }: NoticePageProps) {
  const { page: pageParam } = await searchParams;
  const requested = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;

  let result: Awaited<ReturnType<typeof listActiveCustomerNewsPage>> | null =
    null;
  let loadError: string | null = null;

  try {
    result = await listActiveCustomerNewsPage({
      page,
      pageSize: CUSTOMER_NEWS_PAGE_SIZE,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "소식을 불러오지 못했습니다.";
  }

  if (loadError) {
    return (
      <div className="py-8 text-center">
        <p className="text-[16px] text-body">소식을 불러올 수 없습니다.</p>
        <p className="mt-2 text-[13px] text-body">{loadError}</p>
      </div>
    );
  }

  if (!result || result.total === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[16px] text-body">등록된 소식이 없습니다.</p>
      </div>
    );
  }

  const { items, total, totalPages, page: currentPage } = result;

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-[18px] font-bold text-black">소식</h2>

      {items.length === 0 ? (
        <p className="py-6 text-center text-[15px] text-body">
          이 페이지에 표시할 소식이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/notice/${item.id}`}
                className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-white shadow-sm active:opacity-90"
              >
                {item.mediaUrl ? (
                  <div className="h-[96px] w-[96px] shrink-0">
                    <CustomerNewsMedia
                      url={item.mediaUrl}
                      mediaType={item.mediaType}
                      alt=""
                      variant="thumb"
                    />
                  </div>
                ) : (
                  <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center bg-placeholder text-[11px] text-body">
                    소식
                  </div>
                )}
                <div className="min-w-0 flex-1 py-3 pr-3">
                  <p className="text-[11px] text-body">
                    {item.createdAt.slice(0, 10)}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-[16px] font-bold text-black">
                    {item.title}
                  </h3>
                  {item.content ? (
                    <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-body">
                      {item.content}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NoticePagination
        page={currentPage}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}

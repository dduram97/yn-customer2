import Link from "next/link";

interface NoticePaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

function pageHref(page: number) {
  return page <= 1 ? "/notice" : `/notice?page=${page}`;
}

export default function NoticePagination({
  page,
  totalPages,
  total,
}: NoticePaginationProps) {
  if (total <= 0 || totalPages <= 1) return null;

  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav
      aria-label="소식 페이지"
      className="flex flex-col items-center gap-3 pt-2"
    >
      <p className="text-[12px] text-body">
        {total}개 중 {page}/{totalPages} 페이지
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {prevDisabled ? (
          <span className="rounded-full border border-border px-3 py-1.5 text-[13px] text-body/50">
            이전
          </span>
        ) : (
          <Link
            href={pageHref(page - 1)}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-[13px] text-black active:opacity-70"
            scroll
          >
            이전
          </Link>
        )}

        {pages.map((n) =>
          n === page ? (
            <span
              key={n}
              aria-current="page"
              className="min-w-8 rounded-full bg-black px-3 py-1.5 text-center text-[13px] font-medium text-white"
            >
              {n}
            </span>
          ) : (
            <Link
              key={n}
              href={pageHref(n)}
              className="min-w-8 rounded-full border border-border bg-white px-3 py-1.5 text-center text-[13px] text-black active:opacity-70"
              scroll
            >
              {n}
            </Link>
          )
        )}

        {nextDisabled ? (
          <span className="rounded-full border border-border px-3 py-1.5 text-[13px] text-body/50">
            다음
          </span>
        ) : (
          <Link
            href={pageHref(page + 1)}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-[13px] text-black active:opacity-70"
            scroll
          >
            다음
          </Link>
        )}
      </div>
    </nav>
  );
}

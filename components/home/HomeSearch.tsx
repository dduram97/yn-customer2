"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getSearchCategoryLabel,
  groupSearchResults,
  searchHomeContent,
  type HomeSearchContent,
  type SearchResult,
} from "@/lib/home-search";
import {
  trackSearchQuery,
  trackSearchResultClick,
} from "@/lib/analytics-client";
import { scrollToTargetCentered } from "@/lib/scroll-to-target";

type HomeSearchProps = HomeSearchContent;

export default function HomeSearch(props: HomeSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const lastTrackedQueryRef = useRef("");

  const results = useMemo(() => searchHomeContent(props, query), [props, query]);
  const groupedResults = useMemo(() => groupSearchResults(results), [results]);
  const showResults = query.trim().length > 0;

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timer = window.setTimeout(() => {
      if (lastTrackedQueryRef.current === trimmed) return;
      lastTrackedQueryRef.current = trimmed;
      trackSearchQuery(trimmed, results.length > 0);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [query, results]);

  const handleResultClick = (result: SearchResult) => {
    const currentQuery = query.trim();
    trackSearchResultClick(
      currentQuery,
      result.title,
      result.href ?? `/#${result.targetId}`,
      result.category
    );
    setQuery("");
    lastTrackedQueryRef.current = "";

    if (result.href) {
      router.push(result.href);
      return;
    }

    if (pathname !== "/") {
      router.push(`/#${result.targetId}`);
      return;
    }

    scrollToTargetCentered(result.targetId);
  };

  return (
    <section aria-label="콘텐츠 검색" className="space-y-3">
      <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="수산물 이름 또는 키워드를 검색하세요."
          className="min-w-0 flex-1 bg-transparent text-[15px] text-black outline-none placeholder:text-body"
          aria-label="수산물 이름 또는 키워드 검색"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              lastTrackedQueryRef.current = "";
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[14px] text-body active:bg-placeholder"
            aria-label="검색어 지우기"
          >
            ×
          </button>
        )}
      </div>

      {showResults && (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          {groupedResults.length === 0 ? (
            <p className="py-2 text-center text-[14px] text-body">검색 결과가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] font-medium text-black">
                🔍 &quot;{query.trim()}&quot; 검색 결과
              </p>
              {groupedResults.map((group) => (
                <div key={group.category}>
                  <p className="mb-2 text-[13px] font-semibold text-body">
                    {getSearchCategoryLabel(group.category)}
                  </p>
                  <ul className="space-y-1">
                    {group.items.map((result) => (
                      <li key={result.id}>
                        <button
                          type="button"
                          onClick={() => handleResultClick(result)}
                          className="w-full rounded-xl px-3 py-2.5 text-left text-[15px] text-black active:bg-placeholder"
                        >
                          {result.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-black"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 16l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

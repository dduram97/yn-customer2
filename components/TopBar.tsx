"use client";

import { usePathname, useRouter } from "next/navigation";
import { getSeafoodPageTitle } from "@/lib/seafood-guide";

const PAGE_TITLES: Record<string, string> = {
  "/tracking": "배송조회",
  "/guide/storage": "보관방법",
  "/guide/how-to-eat": "손질법",
  "/contact": "소개",
  "/notice": "공지사항",
  "/faq": "자주 묻는 질문",
};

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const seafoodTitle = getSeafoodPageTitle(pathname);
  const title = seafoodTitle ?? PAGE_TITLES[pathname] ?? "영남수산";

  return (
    <header className="sticky top-0 z-50 bg-white pt-8">
      <div className="mx-auto flex h-12 max-w-lg items-center px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="flex h-10 w-10 items-center justify-center text-black active:opacity-60"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1 className="flex-1 text-center text-[17px] font-bold text-black">
          {title}
        </h1>

        <div className="w-10" />
      </div>
    </header>
  );
}

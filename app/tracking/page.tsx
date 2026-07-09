import type { Metadata } from "next";
import { Suspense } from "react";
import TrackingPageClient from "./TrackingPageClient";

export const metadata: Metadata = {
  title: "배송조회",
  description: "영남수산 배송 상태를 확인하세요",
};

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean border-t-transparent" />
          <p className="mt-4 text-navy/60">페이지를 불러오는 중...</p>
        </div>
      }
    >
      <TrackingPageClient />
    </Suspense>
  );
}

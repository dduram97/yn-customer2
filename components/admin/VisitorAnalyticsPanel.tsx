"use client";

import { useEffect, useState } from "react";
import type { AnalyticsPeriod, VisitorAnalyticsSummary } from "@/lib/analytics-types";
import { PeriodFilter } from "@/components/admin/AnalyticsShared";

export default function VisitorAnalyticsPanel() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const [data, setData] = useState<VisitorAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?type=visitor&period=${period}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading || !data) {
    return <div className="text-[15px] text-body">불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <PeriodFilter value={period} onChange={setPeriod} />

      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="text-[13px] text-body">오늘 방문자</p>
        <p className="mt-1 text-[28px] font-bold text-black">
          {data.todayVisitors.toLocaleString()}명
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="mb-4 text-[15px] font-bold text-black">페이지별 조회수 TOP 10</p>
        <div className="space-y-3">
          {data.topPages.length > 0 ? (
            data.topPages.map((item) => (
              <div
                key={`${item.page}-${item.rank}`}
                className="flex items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-[14px] font-medium text-black">
                    {item.rank}위 {item.label}
                  </p>
                  <p className="text-[12px] text-body">{item.page}</p>
                </div>
                <p className="text-[14px] font-semibold text-black">{item.count}회</p>
              </div>
            ))
          ) : (
            <p className="text-[14px] text-body">방문 데이터가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="mb-4 text-[15px] font-bold text-black">인기 콘텐츠 순위</p>
        <div className="space-y-3">
          {data.popularContent.length > 0 ? (
            data.popularContent.map((item) => (
              <div
                key={`${item.label}-${item.rank}`}
                className="flex items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-b-0 last:pb-0"
              >
                <p className="text-[14px] font-medium text-black">
                  {item.rank}위 {item.label}
                </p>
                <p className="text-[14px] font-semibold text-black">{item.count}회</p>
              </div>
            ))
          ) : (
            <p className="text-[14px] text-body">콘텐츠 조회 데이터가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-surface p-4">
        <p className="text-[13px] font-medium text-black">구매 전환 분석 (확장 예정)</p>
        <p className="mt-2 text-[13px] leading-relaxed text-body">
          검색 → 콘텐츠 클릭 → 상품 페이지 → 구매 흐름을 추적할 수 있도록
          conversionLogs 데이터 구조를 준비했습니다.
        </p>
      </div>
    </div>
  );
}

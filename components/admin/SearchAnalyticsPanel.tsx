"use client";

import { useEffect, useState } from "react";
import type { AnalyticsPeriod, SearchAnalyticsSummary } from "@/lib/analytics-types";
import { DonutChart, PeriodFilter } from "@/components/admin/AnalyticsShared";

export default function SearchAnalyticsPanel() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const [data, setData] = useState<SearchAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?type=search&period=${period}`)
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
      <div className="space-y-4">
        <PeriodFilter value={period} onChange={setPeriod} />
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="text-[13px] text-body">총 검색 횟수</p>
          <p className="mt-1 text-[28px] font-bold text-black">
            {data.totalSearches.toLocaleString()}회
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="mb-4 text-[15px] font-bold text-black">검색어 TOP 5</p>
        {data.top5.length > 0 ? (
          <DonutChart segments={data.top5} />
        ) : (
          <p className="text-[14px] text-body">검색 데이터가 없습니다.</p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="mb-4 text-[15px] font-bold text-black">검색 순위</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-body">
                <th className="px-2 py-2 font-medium">순위</th>
                <th className="px-2 py-2 font-medium">검색어</th>
                <th className="px-2 py-2 font-medium">검색 횟수</th>
                <th className="px-2 py-2 font-medium">비율</th>
                <th className="px-2 py-2 font-medium">최근 검색</th>
                <th className="px-2 py-2 font-medium">클릭 전환율</th>
              </tr>
            </thead>
            <tbody>
              {data.rankings.length > 0 ? (
                data.rankings.map((row) => (
                  <tr key={row.query} className="border-b border-border/70">
                    <td className="px-2 py-3 text-black">{row.rank}위</td>
                    <td className="px-2 py-3 text-black">{row.query}</td>
                    <td className="px-2 py-3 text-black">{row.count}회</td>
                    <td className="px-2 py-3 text-black">{row.percent}%</td>
                    <td className="px-2 py-3 text-body">{row.lastSearchedAt}</td>
                    <td className="px-2 py-3 text-black">{row.clickRate}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-body">
                    검색 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

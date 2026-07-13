"use client";

import { useEffect, useState } from "react";
import type {
  AnalyticsPeriod,
  SearchAnalyticsSummary,
} from "@/lib/analytics-types";
import {
  AnalyticsEmpty,
  AnalyticsError,
  AnalyticsLoading,
  defaultAnchorForPeriod,
  DonutChart,
  PeriodFilter,
  TrendChart,
} from "@/components/admin/AnalyticsShared";

export default function SearchAnalyticsPanel() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("day");
  const [date, setDate] = useState(() => defaultAnchorForPeriod("day"));
  const [data, setData] = useState<SearchAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      type: "search",
      period,
      date,
    });

    fetch(`/api/admin/analytics?${params}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || `요청 실패 (${res.status})`);
        }
        return json as SearchAnalyticsSummary;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(null);
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, date]);

  return (
    <div className="space-y-6">
      <PeriodFilter
        period={period}
        date={date}
        onPeriodChange={setPeriod}
        onDateChange={setDate}
      />

      {loading ? <AnalyticsLoading /> : null}
      {!loading && error ? <AnalyticsError message={error} /> : null}

      {!loading && !error && data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="총 검색"
              value={`${data.totalSearches.toLocaleString()}회`}
            />
            <StatCard
              label="성공 검색"
              value={`${data.successSearches.toLocaleString()}회`}
            />
            <StatCard
              label="실패 검색"
              value={`${data.failSearches.toLocaleString()}회`}
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-4 text-[15px] font-bold text-black">성공 / 실패 검색</p>
            {data.totalSearches === 0 ? (
              <AnalyticsEmpty message="선택한 기간의 검색 데이터가 없습니다." />
            ) : (
              <DonutChart segments={data.donut} />
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-4 text-[15px] font-bold text-black">
              검색 추이 (
              {period === "day" ? "시간대" : period === "month" ? "날짜" : "월"}
              )
            </p>
            <TrendChart
              points={data.trend}
              emptyLabel="선택한 기간의 검색 추이가 없습니다."
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-1 text-[15px] font-bold text-black">TOP 검색어</p>
            <p className="mb-4 text-[12px] text-body">
              클릭율 = 검색 후 결과 클릭 비율 (search_click 이벤트 기준)
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-body">
                    <th className="px-2 py-2 font-medium">순위</th>
                    <th className="px-2 py-2 font-medium">검색어</th>
                    <th className="px-2 py-2 font-medium">검색 수</th>
                    <th className="px-2 py-2 font-medium">성공</th>
                    <th className="px-2 py-2 font-medium">실패</th>
                    <th className="px-2 py-2 font-medium">비율</th>
                    <th className="px-2 py-2 font-medium">최근 검색</th>
                    <th className="px-2 py-2 font-medium">클릭율</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankings.length > 0 ? (
                    data.rankings.slice(0, 20).map((row) => (
                      <tr key={row.query} className="border-b border-border/70">
                        <td className="px-2 py-3 text-black">{row.rank}위</td>
                        <td className="px-2 py-3 text-black">{row.query}</td>
                        <td className="px-2 py-3 text-black">{row.count}회</td>
                        <td className="px-2 py-3 text-black">
                          {row.successCount}
                        </td>
                        <td className="px-2 py-3 text-black">{row.failCount}</td>
                        <td className="px-2 py-3 text-black">{row.percent}%</td>
                        <td className="px-2 py-3 text-body">
                          {row.lastSearchedAt}
                        </td>
                        <td className="px-2 py-3 text-black">{row.clickRate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-2 py-6 text-center text-body"
                      >
                        검색 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-[13px] text-body">{label}</p>
      <p className="mt-1 text-[24px] font-bold text-black">{value}</p>
    </div>
  );
}

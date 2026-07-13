"use client";

import { useEffect, useState } from "react";
import type {
  AnalyticsPeriod,
  VisitorAnalyticsSummary,
} from "@/lib/analytics-types";
import {
  AnalyticsEmpty,
  AnalyticsError,
  AnalyticsLoading,
  defaultAnchorForPeriod,
  DonutChart,
  PeriodFilter,
  RankingList,
  TrendChart,
} from "@/components/admin/AnalyticsShared";

export default function VisitorAnalyticsPanel() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("day");
  const [date, setDate] = useState(() => defaultAnchorForPeriod("day"));
  const [data, setData] = useState<VisitorAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      type: "visitor",
      period,
      date,
    });

    fetch(`/api/admin/analytics?${params}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || `요청 실패 (${res.status})`);
        }
        return json as VisitorAnalyticsSummary;
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
              label="총 방문자"
              value={`${data.totalVisitors.toLocaleString()}명`}
              hint="DISTINCT session"
            />
            <StatCard
              label="신규 방문"
              value={`${data.newVisitors.toLocaleString()}명`}
            />
            <StatCard
              label="재방문"
              value={`${data.returningVisitors.toLocaleString()}명`}
            />
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[13px] text-body">오늘 방문자 (한국 시간 기준)</p>
            <p className="mt-1 text-[28px] font-bold text-black">
              {data.todayVisitors.toLocaleString()}명
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-4 text-[15px] font-bold text-black">신규 / 재방문</p>
            {data.totalVisitors === 0 ? (
              <AnalyticsEmpty message="선택한 기간의 방문 데이터가 없습니다." />
            ) : (
              <DonutChart segments={data.donut} />
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-4 text-[15px] font-bold text-black">
              방문 추이 (
              {period === "day" ? "시간대" : period === "month" ? "날짜" : "월"}
              ) · 순 방문자
            </p>
            <TrendChart
              points={data.trend}
              emptyLabel="선택한 기간의 방문 추이가 없습니다."
            />
          </div>

          <RankingList
            title="TOP 페이지"
            rows={data.topPages}
            emptyMessage="페이지 방문 데이터가 없습니다."
          />
          <RankingList
            title="인기 손질법"
            rows={data.topHandling}
            emptyMessage="손질법 조회 데이터가 없습니다."
          />
          <RankingList
            title="인기 보관법"
            rows={data.topStorage}
            emptyMessage="보관법 조회 데이터가 없습니다."
          />
          <RankingList
            title="인기 콘텐츠 종합"
            rows={data.popularContent}
            emptyMessage="콘텐츠 조회 데이터가 없습니다."
          />

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="mb-1 text-[15px] font-bold text-black">
              🐟 인기 수산물 관심도
            </p>
            <p className="mb-4 text-[12px] text-body">
              손질/보관 상세 진입 기준 · 순 방문자 (DISTINCT session_id)
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-body">
                    <th className="px-2 py-2 font-medium">순위</th>
                    <th className="px-2 py-2 font-medium">수산물</th>
                    <th className="px-2 py-2 font-medium">관심 방문자</th>
                    <th className="px-2 py-2 font-medium">비율</th>
                  </tr>
                </thead>
                <tbody>
                  {data.seafoodInterest.length > 0 ? (
                    data.seafoodInterest.map((row) => (
                      <tr
                        key={row.seafood}
                        className="border-b border-border/70"
                      >
                        <td className="px-2 py-3 text-black">{row.rank}</td>
                        <td className="px-2 py-3 text-black">{row.seafood}</td>
                        <td className="px-2 py-3 text-black">
                          {row.visitors.toLocaleString()}명
                        </td>
                        <td className="px-2 py-3 text-black">{row.percent}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-2 py-6 text-center text-body"
                      >
                        수산물 관심 데이터가 없습니다.
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

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-[13px] text-body">{label}</p>
      <p className="mt-1 text-[24px] font-bold text-black">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-body">{hint}</p> : null}
    </div>
  );
}

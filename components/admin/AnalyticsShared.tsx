"use client";

import type { AnalyticsPeriod, DonutSegment, TrendPoint } from "@/lib/analytics-types";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "day", label: "일별" },
  { value: "month", label: "월별" },
  { value: "year", label: "연도별" },
];

function todaySeoulDateInput(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function currentSeoulMonthInput(): string {
  return todaySeoulDateInput().slice(0, 7);
}

function currentSeoulYear(): string {
  return todaySeoulDateInput().slice(0, 4);
}

export function defaultAnchorForPeriod(period: AnalyticsPeriod): string {
  if (period === "day") return todaySeoulDateInput();
  if (period === "month") return currentSeoulMonthInput();
  return currentSeoulYear();
}

interface PeriodFilterProps {
  period: AnalyticsPeriod;
  date: string;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onDateChange: (date: string) => void;
}

export function PeriodFilter({
  period,
  date,
  onPeriodChange,
  onDateChange,
}: PeriodFilterProps) {
  const yearOptions = Array.from({ length: 6 }, (_, i) =>
    String(Number(currentSeoulYear()) - i)
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onPeriodChange(option.value);
              onDateChange(defaultAnchorForPeriod(option.value));
            }}
            className={`rounded-full px-4 py-2 text-[13px] ${
              period === option.value
                ? "bg-black text-white"
                : "border border-border bg-white text-black"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[13px] text-body">기준 일자</label>
        {period === "day" ? (
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-[13px] text-black"
          />
        ) : null}
        {period === "month" ? (
          <input
            type="month"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-[13px] text-black"
          />
        ) : null}
        {period === "year" ? (
          <select
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-[13px] text-black"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}

const CHART_COLORS = ["#111111", "#888888", "#cccccc", "#e5e5e5"];

export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const hasData = segments.some((segment) => segment.value > 0);

  if (!hasData) {
    return (
      <p className="py-6 text-center text-[14px] text-body">표시할 데이터가 없습니다.</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-8">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        <g transform="translate(80 80) rotate(-90)">
          {segments.map((segment, index) => {
            const dash = (segment.percent / 100) * circumference;
            const circle = (
              <circle
                key={`${segment.label}-${index}`}
                r={radius}
                cx={0}
                cy={0}
                fill="transparent"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={18}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return circle;
          })}
        </g>
      </svg>
      <div className="w-full space-y-2">
        {segments.map((segment, index) => (
          <div
            key={segment.label}
            className="flex items-center justify-between gap-3 text-[14px]"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
              <span className="text-black">{segment.label}</span>
            </div>
            <span className="font-medium text-black">
              {segment.value.toLocaleString()} ({segment.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendChart({
  points,
  emptyLabel = "추이 데이터가 없습니다.",
}: {
  points: TrendPoint[];
  emptyLabel?: string;
}) {
  const max = Math.max(...points.map((point) => point.value), 0);
  if (max <= 0) {
    return (
      <p className="py-6 text-center text-[14px] text-body">{emptyLabel}</p>
    );
  }

  const chartHeight = 120;
  const dense = points.length > 16;

  return (
    <div className="space-y-3">
      <div
        className="flex items-end gap-1 overflow-x-auto pb-1"
        style={{ minHeight: chartHeight }}
      >
        {points.map((point) => {
          const height = Math.max(4, Math.round((point.value / max) * chartHeight));
          return (
            <div
              key={point.key}
              className="flex min-w-[18px] flex-1 flex-col items-center gap-1"
              title={`${point.label}: ${point.value}`}
            >
              <span className="text-[10px] text-body">{point.value || ""}</span>
              <div
                className="w-full max-w-[28px] rounded-t bg-black/80"
                style={{ height }}
              />
              <span className="text-[10px] text-body">
                {dense && point.label.endsWith("시")
                  ? point.key
                  : point.label.replace(/(시|일|월)$/, "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsLoading() {
  return <div className="text-[15px] text-body">불러오는 중...</div>;
}

export function AnalyticsError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700">
      <p className="font-medium">통계를 불러오지 못했습니다.</p>
      <p className="mt-1 text-[13px] leading-relaxed">{message}</p>
      <p className="mt-2 text-[12px] text-red-600/80">
        Supabase에 <code className="rounded bg-white px-1">supabase/analytics.sql</code>{" "}
        적용 여부와 환경 변수를 확인해 주세요.
      </p>
    </div>
  );
}

export function AnalyticsEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
      <p className="text-[14px] text-body">{message}</p>
    </div>
  );
}

export function RankingList({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: { rank: number; label: string; count: number; page?: string }[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="mb-1 text-[15px] font-bold text-black">{title}</p>
      <p className="mb-4 text-[12px] text-body">순 방문자 수 (중복 세션 제외)</p>
      <div className="space-y-3">
        {rows.length > 0 ? (
          rows.map((item) => (
            <div
              key={`${item.label}-${item.rank}-${item.page ?? ""}`}
              className="flex items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-b-0 last:pb-0"
            >
              <div>
                <p className="text-[14px] font-medium text-black">
                  {item.rank}위 {item.label}
                </p>
                {item.page ? (
                  <p className="text-[12px] text-body">{item.page}</p>
                ) : null}
              </div>
              <p className="text-[14px] font-semibold text-black">
                {item.count.toLocaleString()}명
              </p>
            </div>
          ))
        ) : (
          <AnalyticsEmpty message={emptyMessage} />
        )}
      </div>
    </div>
  );
}

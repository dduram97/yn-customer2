"use client";

import type { AnalyticsPeriod } from "@/lib/analytics-types";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "오늘" },
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "all", label: "전체" },
];

interface PeriodFilterProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full px-4 py-2 text-[13px] ${
            value === option.value
              ? "bg-black text-white"
              : "border border-border bg-white text-black"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const CHART_COLORS = ["#111111", "#444444", "#777777", "#aaaaaa", "#cccccc", "#e5e5e5"];

export function DonutChart({
  segments,
}: {
  segments: { label: string; percent: number }[];
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

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
          <div key={segment.label} className="flex items-center justify-between gap-3 text-[14px]">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-black">{segment.label}</span>
            </div>
            <span className="font-medium text-black">{segment.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

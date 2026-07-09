"use client";

import type { GuideTextStyle } from "@/lib/types";
import { applyRichTextCommand } from "@/lib/rich-text";

interface RichTextToolbarProps {
  style?: GuideTextStyle;
  onStyleChange?: (style: GuideTextStyle) => void;
  showAlignment?: boolean;
  showFontSize?: boolean;
  compact?: boolean;
}

const FONT_SIZE_OPTIONS: Array<{ value: GuideTextStyle["fontSize"]; label: string }> = [
  { value: "sm", label: "작게" },
  { value: "base", label: "보통" },
  { value: "lg", label: "크게" },
  { value: "xl", label: "더 크게" },
  { value: "2xl", label: "제목" },
  { value: "3xl", label: "대제목" },
];

function ToolbarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-1 text-[12px] ${
        active ? "border-black bg-black text-white" : "border-border bg-white text-black"
      }`}
    >
      {label}
    </button>
  );
}

export default function RichTextToolbar({
  style,
  onStyleChange,
  showAlignment = true,
  showFontSize = true,
}: RichTextToolbarProps) {
  const currentStyle = style ?? {};

  const patchStyle = (patch: Partial<GuideTextStyle>) => {
    onStyleChange?.({ ...currentStyle, ...patch });
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-white p-2">
      {showFontSize ? (
        <select
          value={currentStyle.fontSize ?? "base"}
          onChange={(event) =>
            patchStyle({ fontSize: event.target.value as GuideTextStyle["fontSize"] })
          }
          className="rounded-lg border border-border px-2 py-1 text-[12px]"
        >
          {FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value ?? "base"}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      <ToolbarButton
        label="굵게"
        active={currentStyle.fontWeight === "bold"}
        onClick={() => {
          applyRichTextCommand("bold");
          patchStyle({
            fontWeight: currentStyle.fontWeight === "bold" ? "normal" : "bold",
          });
        }}
      />
      <ToolbarButton
        label="기울임"
        active={currentStyle.fontStyle === "italic"}
        onClick={() => {
          applyRichTextCommand("italic");
          patchStyle({
            fontStyle: currentStyle.fontStyle === "italic" ? "normal" : "italic",
          });
        }}
      />
      <ToolbarButton
        label="밑줄"
        active={currentStyle.textDecoration === "underline"}
        onClick={() => {
          applyRichTextCommand("underline");
          patchStyle({
            textDecoration:
              currentStyle.textDecoration === "underline" ? "none" : "underline",
          });
        }}
      />
      <ToolbarButton
        label="형광펜"
        active={currentStyle.highlight}
        onClick={() => {
          applyRichTextCommand("hiliteColor", "#fef08a");
          patchStyle({ highlight: !currentStyle.highlight });
        }}
      />

      <label className="flex items-center gap-1 text-[12px] text-body">
        색상
        <input
          type="color"
          value={currentStyle.color ?? "#111111"}
          onChange={(event) => {
            applyRichTextCommand("foreColor", event.target.value);
            patchStyle({ color: event.target.value });
          }}
          className="h-7 w-7 cursor-pointer rounded border border-border"
        />
      </label>

      {showAlignment ? (
        <>
          <ToolbarButton
            label="왼쪽"
            active={currentStyle.textAlign === "left" || !currentStyle.textAlign}
            onClick={() => {
              applyRichTextCommand("justifyLeft");
              patchStyle({ textAlign: "left" });
            }}
          />
          <ToolbarButton
            label="가운데"
            active={currentStyle.textAlign === "center"}
            onClick={() => {
              applyRichTextCommand("justifyCenter");
              patchStyle({ textAlign: "center" });
            }}
          />
          <ToolbarButton
            label="오른쪽"
            active={currentStyle.textAlign === "right"}
            onClick={() => {
              applyRichTextCommand("justifyRight");
              patchStyle({ textAlign: "right" });
            }}
          />
        </>
      ) : null}
    </div>
  );
}

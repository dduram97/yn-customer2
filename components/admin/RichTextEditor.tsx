"use client";

import { useEffect, useRef } from "react";
import type { GuideTextStyle } from "@/lib/types";
import RichTextToolbar from "@/components/admin/RichTextToolbar";
import { styleToClassName, styleToInlineStyle } from "@/lib/guide-block-styles";

interface RichTextEditorProps {
  html: string;
  onChange: (html: string) => void;
  style?: GuideTextStyle;
  onStyleChange?: (style: GuideTextStyle) => void;
  placeholder?: string;
  showAlignment?: boolean;
  showFontSize?: boolean;
  minHeightClassName?: string;
}

export default function RichTextEditor({
  html,
  onChange,
  style,
  onStyleChange,
  placeholder = "내용을 입력하세요",
  showAlignment = true,
  showFontSize = true,
  minHeightClassName = "min-h-[120px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== html) {
      editor.innerHTML = html || "";
    }
  }, [html]);

  return (
    <div className="space-y-2">
      <RichTextToolbar
        style={style}
        onStyleChange={onStyleChange}
        showAlignment={showAlignment}
        showFontSize={showFontSize}
      />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className={`rounded-xl border border-border bg-white px-3 py-3 text-[15px] leading-relaxed text-body outline-none focus:border-black ${styleToClassName(
          style
        )} ${minHeightClassName} empty:before:text-body/50 empty:before:content-[attr(data-placeholder)]`}
        style={styleToInlineStyle(style)}
      />
    </div>
  );
}

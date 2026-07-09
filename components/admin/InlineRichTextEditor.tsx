"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { useEffect } from "react";

interface InlineRichTextEditorProps {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
}

function ToolbarButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-black bg-black text-white"
          : "border-border bg-white text-black hover:border-black/40"
      }`}
    >
      {label}
    </button>
  );
}

export default function InlineRichTextEditor({
  html,
  onChange,
  placeholder = "내용을 입력하세요",
  minHeightClassName = "min-h-[120px]",
}: InlineRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bold: {},
        italic: {},
        strike: false,
        code: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: {},
      }),
      Highlight.configure({ multicolor: false }),
    ],
    content: html || "",
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor guide-rich-content ${minHeightClassName} rounded-xl border border-border bg-white px-3 py-3 text-[15px] leading-relaxed text-body outline-none focus:border-black`,
        "data-placeholder": placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = html || "";
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, html]);

  if (!editor) {
    return (
      <div
        className={`rounded-xl border border-border bg-white px-3 py-3 text-[15px] text-body/50 ${minHeightClassName}`}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <ToolbarButton
          label="굵게"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="기울임"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="형광펜"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

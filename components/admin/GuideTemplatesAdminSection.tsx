"use client";

import { useMemo, useState } from "react";
import {
  createGuideTemplate,
  moveTemplateBlocks,
  SEAFOOD_PLACEHOLDER,
} from "@/lib/guide-templates";
import type { GuideTemplate, GuideTemplateBlockDef, GuideTemplateKind } from "@/lib/types";

function TemplateBlockEditor({
  block,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  block: GuideTemplateBlockDef;
  index: number;
  total: number;
  onChange: (patch: Partial<GuideTemplateBlockDef>) => void;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const isHeading = block.type === "heading";

  return (
    <div className="rounded-xl border border-border bg-white p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-body">
          {isHeading ? "제목 블록" : `텍스트 블록 ${index}`}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={index === 0 || isHeading}
            onClick={() => onMove(index, index - 1)}
            className="rounded-lg border border-border px-2 py-1 text-[12px] disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1 || isHeading}
            onClick={() => onMove(index, index + 1)}
            className="rounded-lg border border-border px-2 py-1 text-[12px] disabled:opacity-40"
          >
            ↓
          </button>
          {!isHeading ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg border border-border px-2 py-1 text-[12px]"
            >
              삭제
            </button>
          ) : null}
        </div>
      </div>
      <input
        value={block.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder={isHeading ? `${SEAFOOD_PLACEHOLDER} 손질법` : "섹션 이름"}
        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[15px] outline-none focus:border-black"
      />
      {isHeading ? (
        <p className="text-[12px] text-body">
          `{SEAFOOD_PLACEHOLDER}`는 적용 시 선택한 수산물 이름으로 바뀝니다.
        </p>
      ) : null}
    </div>
  );
}

export default function GuideTemplatesAdminSection({
  eatingGuideTemplates,
  storageGuideTemplates,
  onChange,
}: {
  eatingGuideTemplates: GuideTemplate[];
  storageGuideTemplates: GuideTemplate[];
  onChange: (patch: {
    eatingGuideTemplates?: GuideTemplate[];
    storageGuideTemplates?: GuideTemplate[];
  }) => void;
}) {
  const [kind, setKind] = useState<GuideTemplateKind>("eating");
  const templates = kind === "eating" ? eatingGuideTemplates : storageGuideTemplates;
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0] ?? null,
    [selectedId, templates]
  );

  const updateTemplates = (nextTemplates: GuideTemplate[]) => {
    if (kind === "eating") {
      onChange({ eatingGuideTemplates: nextTemplates });
      return;
    }
    onChange({ storageGuideTemplates: nextTemplates });
  };

  const updateSelectedTemplate = (patch: Partial<GuideTemplate>) => {
    if (!selectedTemplate) return;
    updateTemplates(
      templates.map((template) =>
        template.id === selectedTemplate.id ? { ...template, ...patch } : template
      )
    );
  };

  const handleKindChange = (nextKind: GuideTemplateKind) => {
    setKind(nextKind);
    const nextTemplates =
      nextKind === "eating" ? eatingGuideTemplates : storageGuideTemplates;
    setSelectedId(nextTemplates[0]?.id ?? null);
  };

  const handleCreateTemplate = () => {
    const created = createGuideTemplate(kind);
    updateTemplates([...templates, created]);
    setSelectedId(created.id);
  };

  const handleRenameTemplate = () => {
    if (!selectedTemplate) return;
    const nextName = window.prompt("템플릿 이름을 입력하세요", selectedTemplate.name);
    if (!nextName?.trim()) return;
    updateSelectedTemplate({ name: nextName.trim() });
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return;
    if (templates.length <= 1) {
      window.alert("최소 1개의 템플릿이 필요합니다.");
      return;
    }
    if (!window.confirm(`"${selectedTemplate.name}" 템플릿을 삭제할까요?`)) return;

    const nextTemplates = templates.filter((template) => template.id !== selectedTemplate.id);
    updateTemplates(nextTemplates);
    setSelectedId(nextTemplates[0]?.id ?? null);
  };

  const updateBlock = (index: number, patch: Partial<GuideTemplateBlockDef>) => {
    if (!selectedTemplate) return;
    const nextBlocks = selectedTemplate.blocks.map((block, blockIndex) =>
      blockIndex === index ? { ...block, ...patch } : block
    );
    updateSelectedTemplate({ blocks: nextBlocks });
  };

  const removeBlock = (index: number) => {
    if (!selectedTemplate) return;
    updateSelectedTemplate({
      blocks: selectedTemplate.blocks.filter((_, blockIndex) => blockIndex !== index),
    });
  };

  const addTextBlock = () => {
    if (!selectedTemplate) return;
    updateSelectedTemplate({
      blocks: [...selectedTemplate.blocks, { type: "text", title: "새 섹션" }],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-black">템플릿 관리</p>
        <p className="mt-1 text-[13px] text-body">
          손질법·보관법의 블록 구조를 템플릿으로 저장하고, 수산물별 가이드 작성 시
          적용할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleKindChange("eating")}
          className={`rounded-xl border px-4 py-2 text-[14px] font-medium ${
            kind === "eating"
              ? "border-black bg-black text-white"
              : "border-border bg-white text-black"
          }`}
        >
          손질법 템플릿
        </button>
        <button
          type="button"
          onClick={() => handleKindChange("storage")}
          className={`rounded-xl border px-4 py-2 text-[14px] font-medium ${
            kind === "storage"
              ? "border-black bg-black text-white"
              : "border-border bg-white text-black"
          }`}
        >
          보관법 템플릿
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => setSelectedId(template.id)}
            className={`rounded-xl border px-3 py-2 text-[13px] ${
              selectedTemplate?.id === template.id
                ? "border-black bg-black text-white"
                : "border-border bg-white text-black"
            }`}
          >
            {template.name}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCreateTemplate}
          className="rounded-xl border border-dashed border-border bg-white px-3 py-2 text-[13px] text-body"
        >
          + 새 템플릿
        </button>
      </div>

      {selectedTemplate ? (
        <div className="rounded-2xl border border-border p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-body">템플릿 이름</label>
            <input
              value={selectedTemplate.name}
              onChange={(event) => updateSelectedTemplate({ name: event.target.value })}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[15px] outline-none focus:border-black"
            />
          </div>

          <div className="space-y-3">
            <p className="text-[13px] font-medium text-body">블록 구조</p>
            {selectedTemplate.blocks.map((block, index) => (
              <TemplateBlockEditor
                key={`${selectedTemplate.id}-${index}`}
                block={block}
                index={index}
                total={selectedTemplate.blocks.length}
                onChange={(patch) => updateBlock(index, patch)}
                onMove={(from, to) =>
                  updateSelectedTemplate({
                    blocks: moveTemplateBlocks(selectedTemplate.blocks, from, to),
                  })
                }
                onRemove={() => removeBlock(index)}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addTextBlock}
              className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] font-medium text-black"
            >
              + 텍스트 블록 추가
            </button>
            <button
              type="button"
              onClick={handleRenameTemplate}
              className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] font-medium text-black"
            >
              이름 변경
            </button>
            <button
              type="button"
              onClick={handleDeleteTemplate}
              className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] font-medium text-body"
            >
              삭제
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

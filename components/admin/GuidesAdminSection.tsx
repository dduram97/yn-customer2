"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createEmptyEatingGuide,
  createEmptyStorageGuide,
  upsertEatingGuide,
  upsertStorageGuide,
  type GuideContentStatus,
} from "@/lib/guide-admin";
import {
  buildSyncedEatingAdminList,
  buildSyncedStorageAdminList,
  summarizeSyncedAdminList,
  type SyncedEatingAdminItem,
  type SyncedStorageAdminItem,
} from "@/lib/home-card-sync";
import BlogGuideBlocksEditor from "@/components/admin/BlogGuideBlocksEditor";
import { resolveEditorBlocks, type GuideEditorKind } from "@/lib/guide-blocks";
import {
  createGuideTemplate,
  extractTemplateBlocksFromGuide,
  instantiateGuideTemplate,
} from "@/lib/guide-templates";
import { openGuidePreview } from "@/lib/guide-preview";
import { getSeafoodGuidePath, resolveSeafoodSlug } from "@/lib/seafood-guide";
import type {
  EatingGuide,
  GuideContentBlock,
  GuideTemplate,
  ProductPreview,
  StorageGuide,
} from "@/lib/types";

function VisibilityField({
  isVisible,
  onChange,
}: {
  isVisible: boolean;
  onChange: (visible: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
      <p className="text-[13px] font-medium text-black">노출 상태</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-xl border px-4 py-2 text-[14px] font-medium ${
            isVisible
              ? "border-black bg-black text-white"
              : "border-border bg-white text-black"
          }`}
        >
          공개
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-xl border px-4 py-2 text-[14px] font-medium ${
            !isVisible
              ? "border-black bg-black text-white"
              : "border-border bg-white text-black"
          }`}
        >
          숨김
        </button>
      </div>
      <p className="text-[12px] text-body">
        숨김 시 홈 카드뉴스·검색·목록에서 제외되고, 상세 페이지에는 안내가 표시됩니다.
      </p>
    </div>
  );
}

function SaveTemplateField({
  blocks,
  seafoodName,
  kind,
  onSave,
}: {
  blocks: GuideContentBlock[];
  seafoodName: string;
  kind: GuideEditorKind;
  onSave: (template: GuideTemplate) => void;
}) {
  const handleSave = () => {
    const templateName = window.prompt("저장할 템플릿 이름을 입력하세요");
    if (!templateName?.trim()) return;

    const template = createGuideTemplate(kind);
    onSave({
      ...template,
      name: templateName.trim(),
      blocks: extractTemplateBlocksFromGuide(blocks, seafoodName),
    });
    window.alert("템플릿이 저장되었습니다. 템플릿 관리 메뉴에서 확인할 수 있습니다.");
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] font-medium text-black"
    >
      현재 콘텐츠 템플릿 저장
    </button>
  );
}

function GuidePreviewButton({
  kind,
  slug,
  name,
  imageUrl,
  blocks,
}: {
  kind: GuideEditorKind;
  slug: string;
  name: string;
  imageUrl?: string;
  blocks: GuideContentBlock[];
}) {
  const handlePreview = () => {
    const path = getSeafoodGuidePath(
      slug,
      kind === "eating" ? "cleaning" : "storage"
    );

    openGuidePreview(path, {
      kind,
      slug,
      name,
      imageUrl,
      blocks,
    });
  };

  return (
    <button
      type="button"
      onClick={handlePreview}
      className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] font-medium text-black"
    >
      고객페이지 미리보기
    </button>
  );
}

function TemplateApplyField({
  templates,
  seafoodName,
  onApply,
}: {
  templates: GuideTemplate[];
  seafoodName: string;
  onApply: (blocks: GuideContentBlock[]) => void;
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const handleApply = () => {
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) return;

    if (
      !window.confirm(
        `"${template.name}" 템플릿을 적용하면 현재 블록이 교체됩니다. 계속할까요?`
      )
    ) {
      return;
    }

    onApply(instantiateGuideTemplate(template, seafoodName));
    setSelectedTemplateId("");
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
      <p className="text-[13px] font-medium text-black">템플릿 적용</p>
      <p className="text-[12px] text-body">
        수산물을 선택한 뒤 템플릿을 적용하면 제목과 빈 블록 구조가 생성됩니다.
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedTemplateId}
          onChange={(event) => setSelectedTemplateId(event.target.value)}
          className="min-w-[180px] flex-1 rounded-xl border border-border bg-white px-3 py-2 text-[14px] outline-none focus:border-black"
        >
          <option value="">템플릿 선택...</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selectedTemplateId}
          onClick={handleApply}
          className="rounded-xl border border-black bg-black px-4 py-2 text-[14px] font-medium text-white disabled:opacity-40"
        >
          적용
        </button>
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  imageUrl,
  onUpload,
}: {
  label: string;
  imageUrl?: string;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium text-black">{label}</p>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="max-h-40 rounded-xl border border-border" />
      ) : null}
      <input
        type="file"
        accept="image/*,video/*,.gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
        }}
        className="block w-full text-[13px] text-body"
      />
    </div>
  );
}

function PreviewSelector({
  syncedItems,
  selectedId,
  onSelect,
  cardLabel,
}: {
  syncedItems: Array<{
    preview: ProductPreview;
    status: GuideContentStatus;
    guide?: EatingGuide | StorageGuide;
  }>;
  selectedId: string;
  onSelect: (id: string) => void;
  cardLabel: string;
}) {
  const summary = summarizeSyncedAdminList(syncedItems);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-[13px] text-body">
        <p>
          홈 {cardLabel} 카드 <strong>{summary.total}개</strong> 연동 · 작성 완료{" "}
          <strong>{summary.complete}</strong> · 작성 필요{" "}
          <strong>{summary.needsContent}</strong>
        </p>
        <p className="mt-1">카드뉴스 순서와 동일하게 자동 반영됩니다.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {syncedItems.map(({ preview, status, guide }) => {
          const isComplete = status === "complete";
          const isSelected = selectedId === preview.id;
          const isHidden = guide?.isVisible === false;

          return (
            <button
              key={preview.id}
              type="button"
              onClick={() => onSelect(preview.id)}
              className={`rounded-full px-4 py-2 text-[14px] ${
                isSelected
                  ? "bg-black text-white"
                  : "border border-border bg-white text-black"
              }`}
            >
              {preview.name}{" "}
              <span className={isSelected ? "opacity-90" : "text-body"}>
                {isComplete ? "✅ 작성 완료" : "⚠ 작성 필요"}
                {isHidden ? " · 숨김" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function useSyncedPreviewSelection(previews: ProductPreview[]) {
  const [activePreviewId, setActivePreviewId] = useState(previews[0]?.id ?? "");
  const previousPreviewIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const currentIds = previews.map((preview) => preview.id);
    const previousIds = previousPreviewIdsRef.current;
    const newIds = currentIds.filter((id) => !previousIds.includes(id));

    if (previews.length === 0) {
      setActivePreviewId("");
    } else if (newIds.length > 0) {
      setActivePreviewId(newIds[newIds.length - 1]);
    } else if (!currentIds.includes(activePreviewId)) {
      setActivePreviewId(currentIds[0]);
    }

    previousPreviewIdsRef.current = currentIds;
  }, [previews, activePreviewId]);

  const preview =
    previews.find((item) => item.id === activePreviewId) ?? previews[0];

  return { preview, setActivePreviewId };
}

function useGuideEditorBlocks(
  guide: EatingGuide | StorageGuide,
  kind: GuideEditorKind,
  seafoodName: string,
  previewId: string
) {
  const [editorBlocks, setEditorBlocks] = useState<GuideContentBlock[]>(() =>
    resolveEditorBlocks(guide, kind, seafoodName)
  );

  useEffect(() => {
    setEditorBlocks(resolveEditorBlocks(guide, kind, seafoodName));
    // previewId 변경 시에만 초기화 (편집 중 리셋 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewId, kind]);

  return [editorBlocks, setEditorBlocks] as const;
}

function GuideEditorPanel({
  preview,
  guide,
  kind,
  editorBlocks,
  templates,
  contentStatus,
  onGuidePatch,
  onBlocksChange,
  onTemplatesSave,
  onUpload,
}: {
  preview: ProductPreview;
  guide: EatingGuide | StorageGuide;
  kind: GuideEditorKind;
  editorBlocks: GuideContentBlock[];
  templates: GuideTemplate[];
  contentStatus: GuideContentStatus;
  onGuidePatch: (patch: Partial<EatingGuide | StorageGuide>) => void;
  onBlocksChange: (blocks: GuideContentBlock[]) => void;
  onTemplatesSave: (template: GuideTemplate) => void;
  onUpload: (file: File, onUploaded: (url: string) => void) => void;
}) {
  const slug = resolveSeafoodSlug(preview);
  const isVisible = guide.isVisible !== false;
  const heroImageUrl = guide.imageUrl;

  return (
    <div className="rounded-2xl border border-border p-4 space-y-3">
      {contentStatus === "needs-content" ? (
        <p className="text-[13px] text-body">
          ⚠ 작성 필요 상태입니다. 블록을 작성하고 저장해주세요.
        </p>
      ) : null}

      <VisibilityField
        isVisible={isVisible}
        onChange={(visible) => onGuidePatch({ isVisible: visible })}
      />

      <ImageUploadField
        label="대표 이미지 (상세 페이지 전용)"
        imageUrl={heroImageUrl}
        onUpload={(file) =>
          onUpload(file, (url) => onGuidePatch({ imageUrl: url }))
        }
      />
      <p className="text-[12px] text-body">
        홈 카드뉴스 이미지와 별도로 관리됩니다. 상세 페이지에만 표시됩니다.
      </p>

      <TemplateApplyField
        templates={templates}
        seafoodName={preview.name}
        onApply={onBlocksChange}
      />

      <div className="flex flex-wrap gap-2">
        <SaveTemplateField
          blocks={editorBlocks}
          seafoodName={preview.name}
          kind={kind}
          onSave={onTemplatesSave}
        />
        <GuidePreviewButton
          kind={kind}
          slug={slug}
          name={preview.name}
          imageUrl={heroImageUrl}
          blocks={editorBlocks}
        />
      </div>

      <BlogGuideBlocksEditor
        blocks={editorBlocks}
        onChange={onBlocksChange}
        onUpload={onUpload}
      />
    </div>
  );
}

export function StorageGuidesAdminSection({
  productPreviews,
  storageGuides,
  storageGuideTemplates,
  onChange,
  onTemplatesChange,
  onUpload,
}: {
  productPreviews: ProductPreview[];
  storageGuides: StorageGuide[];
  storageGuideTemplates: GuideTemplate[];
  onChange: (guides: StorageGuide[]) => void;
  onTemplatesChange: (templates: GuideTemplate[]) => void;
  onUpload: (file: File, onUploaded: (url: string) => void) => void;
}) {
  const syncedItems = useMemo<SyncedStorageAdminItem[]>(
    () => buildSyncedStorageAdminList({ productPreviews, storageGuides }),
    [productPreviews, storageGuides]
  );
  const previews = useMemo(
    () => syncedItems.map((item) => item.preview),
    [syncedItems]
  );
  const { preview, setActivePreviewId } = useSyncedPreviewSelection(previews);
  const activeItem = syncedItems.find((item) => item.preview.id === preview?.id);
  const guide =
    activeItem?.guide ??
    (preview ? createEmptyStorageGuide(preview) : createEmptyStorageGuide({
      id: "placeholder",
      name: "",
      imageLabel: "",
    }));
  const [editorBlocks, setEditorBlocks] = useGuideEditorBlocks(
    guide,
    "storage",
    preview?.name ?? "",
    preview?.id ?? ""
  );

  if (!preview || !activeItem) {
    return (
      <p className="text-[14px] text-body">
        홈 화면 보관법 카드에 등록된 수산물이 없습니다.
      </p>
    );
  }

  const contentStatus = activeItem.status;

  const updateGuide = (patch: Partial<StorageGuide>) => {
    onChange(upsertStorageGuide(storageGuides, preview, patch));
  };

  const handleBlocksChange = (blocks: GuideContentBlock[]) => {
    setEditorBlocks(blocks);
    updateGuide({ blocks });
  };

  return (
    <div className="space-y-4">
      <PreviewSelector
        syncedItems={syncedItems}
        selectedId={preview.id}
        onSelect={setActivePreviewId}
        cardLabel="보관법"
      />

      <GuideEditorPanel
        preview={preview}
        guide={guide}
        kind="storage"
        editorBlocks={editorBlocks}
        templates={storageGuideTemplates}
        contentStatus={contentStatus}
        onGuidePatch={updateGuide}
        onBlocksChange={handleBlocksChange}
        onTemplatesSave={(template) =>
          onTemplatesChange([...storageGuideTemplates, template])
        }
        onUpload={onUpload}
      />
    </div>
  );
}

export function EatingGuidesAdminSection({
  handlingPreviews,
  eatingGuides,
  eatingGuideTemplates,
  onChange,
  onTemplatesChange,
  onUpload,
}: {
  handlingPreviews: ProductPreview[];
  eatingGuides: EatingGuide[];
  eatingGuideTemplates: GuideTemplate[];
  onChange: (guides: EatingGuide[]) => void;
  onTemplatesChange: (templates: GuideTemplate[]) => void;
  onUpload: (file: File, onUploaded: (url: string) => void) => void;
}) {
  const syncedItems = useMemo<SyncedEatingAdminItem[]>(
    () => buildSyncedEatingAdminList({ handlingPreviews, eatingGuides }),
    [handlingPreviews, eatingGuides]
  );
  const previews = useMemo(
    () => syncedItems.map((item) => item.preview),
    [syncedItems]
  );
  const { preview, setActivePreviewId } = useSyncedPreviewSelection(previews);
  const activeItem = syncedItems.find((item) => item.preview.id === preview?.id);
  const guide =
    activeItem?.guide ??
    (preview ? createEmptyEatingGuide(preview) : createEmptyEatingGuide({
      id: "placeholder",
      name: "",
      imageLabel: "",
    }));
  const [editorBlocks, setEditorBlocks] = useGuideEditorBlocks(
    guide,
    "eating",
    preview?.name ?? "",
    preview?.id ?? ""
  );

  if (!preview || !activeItem) {
    return (
      <p className="text-[14px] text-body">
        홈 화면 손질법 카드에 등록된 수산물이 없습니다.
      </p>
    );
  }

  const contentStatus = activeItem.status;

  const updateGuide = (patch: Partial<EatingGuide>) => {
    onChange(upsertEatingGuide(eatingGuides, preview, patch));
  };

  const handleBlocksChange = (blocks: GuideContentBlock[]) => {
    setEditorBlocks(blocks);
    updateGuide({ blocks });
  };

  return (
    <div className="space-y-4">
      <PreviewSelector
        syncedItems={syncedItems}
        selectedId={preview.id}
        onSelect={setActivePreviewId}
        cardLabel="손질법"
      />

      <GuideEditorPanel
        preview={preview}
        guide={guide}
        kind="eating"
        editorBlocks={editorBlocks}
        templates={eatingGuideTemplates}
        contentStatus={contentStatus}
        onGuidePatch={updateGuide}
        onBlocksChange={handleBlocksChange}
        onTemplatesSave={(template) =>
          onTemplatesChange([...eatingGuideTemplates, template])
        }
        onUpload={onUpload}
      />
    </div>
  );
}

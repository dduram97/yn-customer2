"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InlineRichTextEditor from "@/components/admin/InlineRichTextEditor";
import {
  createMediaBlock,
  createTextBlock,
  isHeadingBlock,
  moveGuideBlocks,
} from "@/lib/guide-blocks";
import { inferMediaTypeFromFile, inferMediaTypeFromUrl } from "@/lib/media";
import type { GuideContentBlock } from "@/lib/types";

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 8;

function MediaPreview({ url, mediaType }: { url: string; mediaType: string }) {
  if (mediaType === "video") {
    return (
      <video
        src={`${url}#t=0.1`}
        preload="metadata"
        muted
        playsInline
        className="max-h-48 w-full rounded-xl border border-border bg-black object-cover"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="max-h-48 rounded-xl border border-border object-cover" />
  );
}

function BlockTitleInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[15px] font-bold text-black outline-none focus:border-black"
    />
  );
}

export default function BlogGuideBlocksEditor({
  blocks,
  onChange,
  onUpload,
}: {
  blocks: GuideContentBlock[];
  onChange: (blocks: GuideContentBlock[]) => void;
  onUpload: (file: File, onUploaded: (url: string) => void) => void;
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blocksRef = useRef(blocks);
  const draggingIndexRef = useRef<number | null>(null);
  const dragActiveRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const pendingDragRef = useRef<{
    index: number;
    pointerId: number;
    element: HTMLDivElement;
  } | null>(null);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const updateBlock = (index: number, patch: Partial<GuideContentBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...patch } as GuideContentBlock;
    onChange(next);
  };

  const removeBlock = (index: number) => {
    if (isHeadingBlock(blocks[index])) return;
    onChange(blocks.filter((_, blockIndex) => blockIndex !== index));
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const getDropIndex = (clientY: number) => {
    const nodes = blockRefs.current;
    if (!nodes.length) return 0;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }

    return nodes.length - 1;
  };

  const endDrag = () => {
    dragActiveRef.current = false;
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    pendingDragRef.current = null;
    clearLongPressTimer();
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const pending = pendingDragRef.current;

      if (!dragActiveRef.current && pending) {
        const dx = Math.abs(event.clientX - pointerStartRef.current.x);
        const dy = Math.abs(event.clientY - pointerStartRef.current.y);
        if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) {
          clearLongPressTimer();
        }
        return;
      }

      const currentIndex = draggingIndexRef.current;
      if (!dragActiveRef.current || currentIndex === null) return;

      event.preventDefault();
      const targetIndex = getDropIndex(event.clientY);
      if (targetIndex !== currentIndex) {
        const nextBlocks = moveGuideBlocks(blocksRef.current, currentIndex, targetIndex);
        blocksRef.current = nextBlocks;
        draggingIndexRef.current = targetIndex;
        setDraggingIndex(targetIndex);
        onChange(nextBlocks);
      }
    },
    [onChange]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPressTimer();
    endDrag();
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const startDrag = (index: number, element: HTMLDivElement, pointerId: number) => {
    dragActiveRef.current = true;
    draggingIndexRef.current = index;
    setDraggingIndex(index);
    element.setPointerCapture(pointerId);
  };

  const onHandlePointerDown = (
    index: number,
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    const element = blockRefs.current[index];
    if (!element) return;

    pendingDragRef.current = {
      index,
      pointerId: event.pointerId,
      element,
    };

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      if (!pendingDragRef.current) return;
      startDrag(index, element, event.pointerId);
    }, LONG_PRESS_MS);
  };

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div>
        <p className="text-[14px] font-bold text-black">콘텐츠 블록</p>
        <p className="mt-1 text-[13px] text-body">
          블로그처럼 블록을 추가하고 순서를 변경할 수 있습니다. 길게 누른 뒤
          드래그하거나 ↑↓ 버튼으로 이동하세요.
        </p>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            ref={(node) => {
              blockRefs.current[index] = node;
            }}
            className={`rounded-2xl border bg-surface p-4 transition-opacity ${
              draggingIndex === index ? "border-black opacity-70" : "border-border"
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="블록 순서 변경"
                  onPointerDown={(event) => onHandlePointerDown(index, event)}
                  className="cursor-grab rounded-lg border border-border bg-white px-2 py-1 text-[14px] active:cursor-grabbing"
                >
                  ☰
                </button>
                <p className="text-[13px] font-medium text-body">
                  {block.type === "heading"
                    ? "제목"
                    : block.type === "text"
                      ? "텍스트"
                      : "미디어"}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onChange(moveGuideBlocks(blocks, index, index - 1))}
                  className="rounded-lg border border-border px-2 py-1 text-[12px] disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === blocks.length - 1}
                  onClick={() => onChange(moveGuideBlocks(blocks, index, index + 1))}
                  className="rounded-lg border border-border px-2 py-1 text-[12px] disabled:opacity-40"
                >
                  ↓
                </button>
                {!isHeadingBlock(block) ? (
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="rounded-lg border border-border px-2 py-1 text-[12px]"
                  >
                    삭제
                  </button>
                ) : null}
              </div>
            </div>

            {block.type === "heading" ? (
              <BlockTitleInput
                value={block.title}
                onChange={(title) => updateBlock(index, { title })}
                placeholder="제목을 입력하세요"
              />
            ) : null}

            {block.type === "text" ? (
              <div className="space-y-3">
                <BlockTitleInput
                  value={block.title}
                  onChange={(title) => updateBlock(index, { title })}
                  placeholder="블록 이름을 입력하세요"
                />
                <InlineRichTextEditor
                  html={block.content}
                  onChange={(content) => updateBlock(index, { content })}
                  placeholder="내용을 입력하세요"
                />
              </div>
            ) : null}

            {block.type === "media" ? (
              <div className="space-y-2">
                {block.url ? (
                  <MediaPreview
                    url={block.url}
                    mediaType={inferMediaTypeFromUrl(block.url, block.mediaType)}
                  />
                ) : null}
                <p className="text-[13px] text-body">
                  형식:{" "}
                  {block.url
                    ? inferMediaTypeFromUrl(block.url, block.mediaType)
                    : "업로드 후 자동 감지"}
                </p>
                <input
                  type="file"
                  accept="image/*,video/*,.gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    onUpload(file, (url) => {
                      updateBlock(index, {
                        url,
                        mediaType: inferMediaTypeFromFile(file),
                      });
                    });
                  }}
                  className="block w-full text-[13px] text-body"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([...blocks, createTextBlock()])}
          className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] font-medium text-black"
        >
          + 텍스트 추가
        </button>
        <button
          type="button"
          onClick={() => onChange([...blocks, createMediaBlock()])}
          className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] font-medium text-black"
        >
          + 미디어 추가
        </button>
      </div>
    </div>
  );
}

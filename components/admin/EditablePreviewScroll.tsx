"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import type { ProductPreview } from "@/lib/types";

type PreviewVariant = "handling" | "storage";

interface EditablePreviewScrollProps {
  variant: PreviewVariant;
  title: string;
  items: ProductPreview[];
  onChange: (items: ProductPreview[]) => void;
  onUpload: (file: File, index: number) => void;
}

const CONFIG = {
  handling: {
    scrollGap: "gap-4",
    itemWidth: 72,
    hint: "사진 탭: 업로드 · 이름 탭: 수정 · 길게 누른 뒤 드래그: 순서 변경",
  },
  storage: {
    scrollGap: "gap-3",
    itemWidth: 130,
    hint: "사진 탭: 업로드 · 이름 탭: 수정 · 길게 누른 뒤 드래그: 순서 변경",
  },
} as const;

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 8;
const SCROLL_STEP = 220;

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function createPreviewItem(
  variant: PreviewVariant,
  items: ProductPreview[]
): ProductPreview {
  const baseId = `${variant}-${Date.now()}`;
  let id = baseId;
  let suffix = 1;

  while (items.some((item) => item.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return {
    id,
    name: "새 항목",
    imageLabel: "새 항목",
    anchorId: id,
  };
}

export default function EditablePreviewScroll({
  variant,
  title,
  items,
  onChange,
  onUpload,
}: EditablePreviewScrollProps) {
  const config = CONFIG[variant];

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemsRef = useRef(items);
  const uploadIndexRef = useRef<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragActiveRef = useRef(false);
  const suppressClickRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const pendingDragRef = useRef<{
    index: number;
    pointerId: number;
    element: HTMLDivElement;
  } | null>(null);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    itemsRef.current = items;
    updateScrollButtons();
  }, [items, updateScrollButtons]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items, updateScrollButtons]);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const getDropIndex = (clientX: number) => {
    const nodes = itemRefs.current;
    if (!nodes.length) return 0;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      if (clientX < midpoint) return i;
    }

    return nodes.length - 1;
  };

  const endDrag = () => {
    dragActiveRef.current = false;
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    pendingDragRef.current = null;
    clearLongPressTimer();
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
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
      const targetIndex = getDropIndex(event.clientX);
      if (targetIndex !== currentIndex) {
        const nextItems = moveItem(itemsRef.current, currentIndex, targetIndex);
        itemsRef.current = nextItems;
        draggingIndexRef.current = targetIndex;
        setDraggingIndex(targetIndex);
        onChange(nextItems);
      }
    },
    [onChange]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPressTimer();
    if (dragActiveRef.current) {
      suppressClickRef.current = true;
    }
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

  const startPointerPress = (
    event: React.PointerEvent<HTMLDivElement>,
    index: number
  ) => {
    if (editingIndex !== null) return;

    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    pendingDragRef.current = {
      index,
      pointerId: event.pointerId,
      element: event.currentTarget,
    };

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      const pending = pendingDragRef.current;
      if (!pending || pending.index !== index) return;

      dragActiveRef.current = true;
      suppressClickRef.current = true;
      draggingIndexRef.current = index;
      setDraggingIndex(index);
      setEditingIndex(null);
      pending.element.setPointerCapture(pending.pointerId);
    }, LONG_PRESS_MS);
  };

  const handleNameSave = (index: number) => {
    const trimmed = draftName.trim();
    if (trimmed) {
      const next = [...items];
      next[index] = {
        ...next[index],
        name: trimmed,
        imageLabel: trimmed,
      };
      onChange(next);
    }
    setEditingIndex(null);
  };

  const openNameEditor = (index: number) => {
    if (suppressClickRef.current || dragActiveRef.current) return;
    setEditingIndex(index);
    setDraftName(items[index].name);
  };

  const openImageUpload = (index: number) => {
    if (suppressClickRef.current || dragActiveRef.current) return;
    uploadIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const selectItem = (index: number) => {
    if (suppressClickRef.current || dragActiveRef.current) return;
    setSelectedIndex(index);
    setEditingIndex(null);
  };

  const addItem = () => {
    const nextItem = createPreviewItem(variant, items);
    const nextItems = [...items, nextItem];
    onChange(nextItems);
    setSelectedIndex(nextItems.length - 1);
    setEditingIndex(nextItems.length - 1);
    setDraftName(nextItem.name);
    window.setTimeout(updateScrollButtons, 0);
  };

  const removeItem = () => {
    if (selectedIndex === null || items.length === 0) return;

    const nextItems = items.filter((_, index) => index !== selectedIndex);
    onChange(nextItems);
    setSelectedIndex(null);
    setEditingIndex(null);
    window.setTimeout(updateScrollButtons, 0);
  };

  return (
    <section className="space-y-4">
      <p className="flex items-center gap-1 text-[18px] font-bold text-black">
        {title}
        <span aria-hidden className="text-body">
          ›
        </span>
      </p>
      <p className="text-[12px] text-body">
        {config.hint} · 항목 탭: 선택
      </p>

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-SCROLL_STEP)}
            className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-[16px] text-black shadow-sm"
            aria-label="왼쪽으로 더 보기"
          >
            ‹
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy(SCROLL_STEP)}
            className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-[16px] text-black shadow-sm"
            aria-label="오른쪽으로 더 보기"
          >
            ›
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className={`-mx-4 flex overflow-x-auto px-4 pb-2 scrollbar-hide ${config.scrollGap}`}
        >
          {items.map((product, index) => (
            <div
              key={product.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={`relative shrink-0 select-none touch-pan-x ${
                draggingIndex === index ? "z-10" : ""
              }`}
              onPointerDown={(event) => startPointerPress(event, index)}
              onClick={() => selectItem(index)}
              onContextMenu={(event) => event.preventDefault()}
            >
              {variant === "handling" ? (
                <div
                  className={`flex w-[72px] flex-col items-center gap-2 transition-transform ${
                    draggingIndex === index
                      ? "scale-105 rounded-2xl ring-2 ring-black/30 shadow-md"
                      : selectedIndex === index
                        ? "rounded-2xl ring-2 ring-black"
                        : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openImageUpload(index);
                    }}
                    className="h-[72px] w-[72px] overflow-hidden rounded-full active:opacity-80"
                    aria-label={`${product.name} 사진 변경`}
                  >
                    <ImagePlaceholder
                      label={product.name}
                      src={product.imageUrl}
                      aspectRatio="square"
                      compact
                      className="h-full rounded-full border-0"
                    />
                  </button>
                  {editingIndex === index ? (
                    <input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onBlur={() => handleNameSave(index)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleNameSave(index);
                        if (event.key === "Escape") setEditingIndex(null);
                      }}
                      autoFocus
                      className="w-full rounded-md border border-border px-1 py-0.5 text-center text-[14px] font-medium text-black outline-none focus:border-black"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openNameEditor(index);
                      }}
                      className="text-center text-[14px] font-medium text-black active:opacity-70"
                    >
                      {product.name}
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`w-[130px] transition-transform ${
                    draggingIndex === index
                      ? "scale-105 rounded-2xl ring-2 ring-black/30 shadow-md"
                      : selectedIndex === index
                        ? "rounded-2xl ring-2 ring-black"
                        : ""
                  }`}
                >
                  <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openImageUpload(index);
                      }}
                      className="block h-[150px] w-full active:opacity-90"
                      aria-label={`${product.name} 사진 변경`}
                    >
                      <ImagePlaceholder
                        label={product.name}
                        src={product.imageUrl}
                        aspectRatio="square"
                        compact
                        className="h-full rounded-none border-0"
                      />
                    </button>
                    <div className="px-3 py-3">
                      <p className="text-[12px] text-body">보관법</p>
                      {editingIndex === index ? (
                        <input
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          onBlur={() => handleNameSave(index)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleNameSave(index);
                            if (event.key === "Escape") setEditingIndex(null);
                          }}
                          autoFocus
                          className="mt-0.5 w-full rounded-md border border-border px-1 py-0.5 text-[15px] font-bold text-black outline-none focus:border-black"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openNameEditor(index);
                          }}
                          className="mt-0.5 text-left text-[15px] font-bold text-black active:opacity-70"
                        >
                          {product.name}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addItem}
          className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-[14px] font-medium text-black active:bg-placeholder"
        >
          항목 추가
        </button>
        <button
          type="button"
          onClick={removeItem}
          disabled={selectedIndex === null}
          className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-[14px] font-medium text-black active:bg-placeholder disabled:opacity-40"
        >
          항목 제거
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const index = uploadIndexRef.current;
          if (file && index !== null) onUpload(file, index);
          event.target.value = "";
        }}
      />
    </section>
  );
}

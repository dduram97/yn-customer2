"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CustomerNewsItem,
  CustomerNewsMediaType,
} from "@/lib/customer-news";
import {
  inferMediaTypeFromFile,
  resolveMediaDisplaySrc,
} from "@/lib/media";
import CustomerNewsMedia from "@/components/CustomerNewsMedia";

interface CustomerNewsAdminSectionProps {
  uploadImage: (file: File, onUploaded: (url: string) => void) => void;
  /** Lets parent "변경사항 저장" also persist an open news draft. */
  registerDraftSaver?: (saver: (() => Promise<boolean>) | null) => void;
}

type Draft = {
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: CustomerNewsMediaType | null;
  isActive: boolean;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  content: "",
  mediaUrl: "",
  mediaType: null,
  isActive: true,
};

const MEDIA_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm";

function mediaTypeLabel(type: CustomerNewsMediaType | null | undefined) {
  if (type === "video") return "영상";
  if (type === "gif") return "GIF";
  if (type === "image") return "이미지";
  return "미디어 없음";
}

function DraftMediaPreview({ draft }: { draft: Draft }) {
  const src = resolveMediaDisplaySrc(draft.mediaUrl || undefined);
  if (!src) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-white text-[13px] text-body">
        미디어 없음
      </div>
    );
  }

  if (draft.mediaType === "video" || (draft.mediaType == null && /\.(mp4|webm|mov)(\?|$)/i.test(src))) {
    return (
      <video
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        controls
        className="h-36 w-full rounded-xl bg-black object-contain"
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={src} alt="" className="h-36 w-full rounded-xl object-cover" />
  );
}

export default function CustomerNewsAdminSection({
  uploadImage,
  registerDraftSaver,
}: CustomerNewsAdminSectionProps) {
  const [items, setItems] = useState<CustomerNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const editingIdRef = useRef(editingId);
  const draftRef = useRef(draft);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/news");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "불러오기 실패");
      setItems(json.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persistDraft = useCallback(async (): Promise<boolean> => {
    const currentEditingId = editingIdRef.current;
    const currentDraft = draftRef.current;
    if (!currentEditingId) return false;

    if (currentDraft.mediaUrl.startsWith("blob:")) {
      throw new Error(
        "소식 미디어 업로드가 아직 끝나지 않았습니다. 잠시 후 다시 저장해 주세요."
      );
    }

    const payload = {
      title: currentDraft.title,
      content: currentDraft.content,
      mediaUrl: currentDraft.mediaUrl || null,
      mediaType: currentDraft.mediaType,
      isActive: currentDraft.isActive,
    };

    if (currentEditingId === "new") {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "작성 실패");
      setMessage(
        "소식이 등록되었습니다. 고객 공지사항 탭에서 확인해 주세요."
      );
    } else {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentEditingId, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "수정 실패");
      setMessage("소식이 수정되었습니다.");
    }

    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    await load();
    return true;
  }, [load]);

  useEffect(() => {
    if (!registerDraftSaver) return;
    registerDraftSaver(persistDraft);
    return () => registerDraftSaver(null);
  }, [registerDraftSaver, persistDraft]);

  const startCreate = () => {
    setEditingId("new");
    setDraft(EMPTY_DRAFT);
    setMessage("");
  };

  const startEdit = (item: CustomerNewsItem) => {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      content: item.content,
      mediaUrl: item.mediaUrl ?? item.imageUrl ?? "",
      mediaType: item.mediaType,
      isActive: item.isActive,
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const clearMedia = () => {
    setDraft((prev) => ({ ...prev, mediaUrl: "", mediaType: null }));
  };

  const saveDraft = async () => {
    setSaving(true);
    setMessage("");
    try {
      await persistDraft();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: CustomerNewsItem) => {
    try {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "변경 실패");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "변경 실패");
    }
  };

  const remove = async (item: CustomerNewsItem) => {
    if (!window.confirm(`「${item.title}」 소식을 삭제할까요?`)) return;
    try {
      const res = await fetch(
        `/api/admin/news?id=${encodeURIComponent(item.id)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "삭제 실패");
      if (editingId === item.id) cancelEdit();
      await load();
      setMessage("삭제되었습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-black">고객 소식 관리</p>
          <p className="mt-1 text-[13px] text-body">
            이미지·GIF·영상 소식을 작성하고 노출을 관리합니다. 작성 중에는 카드
            안 「소식 저장」또는 하단 「변경사항 저장」으로 등록됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="shrink-0 rounded-full bg-black px-4 py-2 text-[13px] text-white"
        >
          새 소식 작성
        </button>
      </div>

      {message ? <p className="text-[13px] text-body">{message}</p> : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
          {error}
          <p className="mt-1 text-[12px]">
            Supabase에 <code>customer-news.sql</code> 실행 후, 가능하면{" "}
            <code>customer-news-media.sql</code>도 적용해 주세요. (미적용 시에도
            image_url로 저장됩니다)
          </p>
        </div>
      ) : null}

      {editingId ? (
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <p className="text-[14px] font-bold text-black">
            {editingId === "new" ? "새 소식 작성" : "소식 수정"}
          </p>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-black">
              제목
            </span>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[15px] outline-none focus:border-black"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-black">
              본문 (줄바꿈 지원)
            </span>
            <textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={5}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[15px] outline-none focus:border-black"
            />
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="block text-[13px] font-medium text-black">
                대표 미디어
              </span>
              <span className="text-[12px] text-body">
                {mediaTypeLabel(draft.mediaType)}
              </span>
            </div>
            <DraftMediaPreview draft={draft} />
            <p className="text-[12px] text-body">
              jpg / png / webp / gif / mp4 / webm
            </p>
            <input
              type="file"
              accept={MEDIA_ACCEPT}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const nextType = inferMediaTypeFromFile(file);
                setDraft((prev) => ({ ...prev, mediaType: nextType }));
                uploadImage(file, (url) =>
                  setDraft((prev) => ({
                    ...prev,
                    mediaUrl: url,
                    mediaType: nextType,
                  }))
                );
                e.target.value = "";
              }}
              className="block w-full text-[13px] text-body"
            />
            {draft.mediaUrl ? (
              <button
                type="button"
                onClick={clearMedia}
                className="text-[12px] text-red-600"
              >
                미디어 제거
              </button>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-[14px] text-black">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) =>
                setDraft({ ...draft, isActive: e.target.checked })
              }
            />
            고객 페이지에 노출
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveDraft()}
              className="rounded-xl bg-black px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {saving ? "저장 중..." : "소식 저장"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-black"
            >
              취소
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-[14px] text-body">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-[14px] text-body">
          등록된 소식이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-body">
            최근 소식 {items.length}건
          </p>
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <div className="flex gap-3 p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-placeholder">
                  {item.mediaUrl ? (
                    <CustomerNewsMedia
                      url={item.mediaUrl}
                      mediaType={item.mediaType}
                      alt=""
                      variant="thumb"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-body">
                      No media
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px] font-bold text-black">
                      {item.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                        item.isActive
                          ? "bg-black text-white"
                          : "bg-placeholder text-body"
                      }`}
                    >
                      {item.isActive ? "노출 ON" : "노출 OFF"}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-body">
                    {item.createdAt.slice(0, 10)} ·{" "}
                    {mediaTypeLabel(item.mediaType)}
                  </p>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-[13px] text-body">
                    {item.content || "본문 없음"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-black"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => void toggleActive(item)}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-black"
                >
                  {item.isActive ? "노출 OFF" : "노출 ON"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewId((prev) => (prev === item.id ? null : item.id))
                  }
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-black"
                >
                  {previewId === item.id ? "미리보기 닫기" : "미리보기"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-[12px] text-red-600"
                >
                  삭제
                </button>
              </div>
              {previewId === item.id ? (
                <div className="border-t border-border bg-surface p-4">
                  <p className="text-[12px] font-medium text-body">
                    고객 미리보기
                  </p>
                  <p className="mt-2 text-[17px] font-bold text-black">
                    {item.title}
                  </p>
                  {item.mediaUrl ? (
                    <div className="mt-3 overflow-hidden rounded-xl">
                      <CustomerNewsMedia
                        url={item.mediaUrl}
                        mediaType={item.mediaType}
                        alt={item.title}
                        variant="hero"
                      />
                    </div>
                  ) : null}
                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-black">
                    {item.content}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

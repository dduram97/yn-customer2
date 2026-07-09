"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HOME_SECTION_LABELS,
  normalizeHomeSectionOrder,
} from "@/lib/home-section-order";
import EditablePreviewScroll from "@/components/admin/EditablePreviewScroll";
import {
  EatingGuidesAdminSection,
  StorageGuidesAdminSection,
} from "@/components/admin/GuidesAdminSection";
import GuideTemplatesAdminSection from "@/components/admin/GuideTemplatesAdminSection";
import SearchAnalyticsPanel from "@/components/admin/SearchAnalyticsPanel";
import VisitorAnalyticsPanel from "@/components/admin/VisitorAnalyticsPanel";
import type { HomeSectionId, SiteContent } from "@/lib/types";
import { isVideoMedia } from "@/lib/media";

type SectionKey =
  | "site"
  | "contact"
  | "eating-guides"
  | "storage-guides"
  | "guide-templates"
  | "faq"
  | "search-analytics"
  | "visitor-analytics";

export default function AdminPage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("site");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((data) => setContent(data));
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    setSaving(false);
    const data = await response.json().catch(() => ({}));
    setMessage(
      response.ok
        ? "저장되었습니다."
        : typeof data.error === "string"
          ? data.error
          : "저장에 실패했습니다."
    );
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const uploadImage = async (file: File, onUploaded: (url: string) => void) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) return;
    const data = await response.json();
    onUploaded(data.url);
  };

  if (!content) {
    return <div className="p-6 text-[15px] text-body">불러오는 중...</div>;
  }

  const sections: { key: SectionKey; label: string }[] = [
    { key: "site", label: "홈" },
    { key: "contact", label: "소개" },
    { key: "eating-guides", label: "손질법 관리" },
    { key: "storage-guides", label: "보관법 관리" },
    { key: "guide-templates", label: "템플릿 관리" },
    { key: "faq", label: "FAQ" },
    { key: "search-analytics", label: "검색 분석" },
    { key: "visitor-analytics", label: "방문자 분석" },
  ];

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-6 pb-20">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-black">사이트 관리</h1>
          <p className="mt-1 text-[14px] text-body">글과 사진을 수정할 수 있습니다.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-border px-3 py-2 text-[14px] text-body"
        >
          로그아웃
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-[14px] ${
              activeSection === section.key
                ? "bg-black text-white"
                : "border border-border bg-white text-black"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeSection === "site" && (
          <>
            <Field
              label="브랜드명"
              value={content.siteConfig.brandName}
              onChange={(value) =>
                setContent({
                  ...content,
                  siteConfig: { ...content.siteConfig, brandName: value },
                })
              }
            />
            <Field
              label="홈 헤더 부제"
              value={content.pageContent.brandHeaderSubtitle}
              onChange={(value) =>
                setContent({
                  ...content,
                  pageContent: { ...content.pageContent, brandHeaderSubtitle: value },
                })
              }
            />
            <HomeSectionOrderEditor
              order={content.homeSectionOrder}
              onChange={(homeSectionOrder) =>
                setContent({ ...content, homeSectionOrder })
              }
            />

            <p className="pt-2 text-[15px] font-bold text-black">홈 배너</p>
            {content.heroSlides.map((slide, index) => (
              <div key={slide.id} className="rounded-2xl border border-border p-4 space-y-3">
                <p className="text-[14px] font-bold text-black">배너 {index + 1}</p>
                <Field
                  label="제목"
                  value={slide.title}
                  onChange={(value) => {
                    const heroSlides = [...content.heroSlides];
                    heroSlides[index] = { ...slide, title: value };
                    setContent({ ...content, heroSlides });
                  }}
                />
                <MediaUploadField
                  label="배너 미디어"
                  mediaUrl={slide.imageUrl}
                  onUpload={(file) =>
                    uploadImage(file, (url) => {
                      const heroSlides = [...content.heroSlides];
                      heroSlides[index] = { ...slide, imageUrl: url };
                      setContent({ ...content, heroSlides });
                    })
                  }
                />
              </div>
            ))}
            <div className="mx-auto max-w-lg space-y-8 pt-4">
              <EditablePreviewScroll
                variant="handling"
                title="수산물 손질법"
                items={content.handlingPreviews}
                onChange={(handlingPreviews) =>
                  setContent({ ...content, handlingPreviews })
                }
                onUpload={(file, index) =>
                  uploadImage(file, (url) => {
                    const handlingPreviews = [...content.handlingPreviews];
                    handlingPreviews[index] = {
                      ...handlingPreviews[index],
                      imageUrl: url,
                    };
                    setContent({ ...content, handlingPreviews });
                  })
                }
              />
              <EditablePreviewScroll
                variant="storage"
                title="수산물 보관법"
                items={content.productPreviews}
                onChange={(productPreviews) =>
                  setContent({ ...content, productPreviews })
                }
                onUpload={(file, index) =>
                  uploadImage(file, (url) => {
                    const productPreviews = [...content.productPreviews];
                    productPreviews[index] = {
                      ...productPreviews[index],
                      imageUrl: url,
                    };
                    setContent({ ...content, productPreviews });
                  })
                }
              />
            </div>
          </>
        )}

        {activeSection === "contact" && (
          <>
            <PageMediaUpload
              label="영남수산 매장 미디어"
              mediaUrl={content.pageImages.contactHero}
              onUpload={(file) =>
                uploadImage(file, (url) =>
                  setContent({
                    ...content,
                    pageImages: { ...content.pageImages, contactHero: url },
                  })
                )
              }
            />
            <Field
              label="전화번호"
              value={content.contactInfo.phone}
              onChange={(value) =>
                setContent({
                  ...content,
                  contactInfo: { ...content.contactInfo, phone: value },
                })
              }
            />
            <Field
              label="카카오톡 URL"
              value={content.contactInfo.kakaoUrl}
              onChange={(value) =>
                setContent({
                  ...content,
                  contactInfo: { ...content.contactInfo, kakaoUrl: value },
                })
              }
            />
            <Field
              label="주소"
              value={content.contactInfo.address}
              onChange={(value) =>
                setContent({
                  ...content,
                  contactInfo: { ...content.contactInfo, address: value },
                })
              }
            />
            <Field
              label="영업시간"
              value={content.contactInfo.businessHours}
              onChange={(value) =>
                setContent({
                  ...content,
                  contactInfo: { ...content.contactInfo, businessHours: value },
                })
              }
            />
            <TextArea
              label="소개 글"
              value={content.contactInfo.description}
              onChange={(value) =>
                setContent({
                  ...content,
                  contactInfo: { ...content.contactInfo, description: value },
                })
              }
            />
          </>
        )}

        {activeSection === "eating-guides" && (
          <EatingGuidesAdminSection
            handlingPreviews={content.handlingPreviews}
            eatingGuides={content.eatingGuides}
            eatingGuideTemplates={content.eatingGuideTemplates ?? []}
            onChange={(eatingGuides) => setContent({ ...content, eatingGuides })}
            onTemplatesChange={(eatingGuideTemplates) =>
              setContent({ ...content, eatingGuideTemplates })
            }
            onUpload={uploadImage}
          />
        )}

        {activeSection === "storage-guides" && (
          <StorageGuidesAdminSection
            productPreviews={content.productPreviews}
            storageGuides={content.storageGuides}
            storageGuideTemplates={content.storageGuideTemplates ?? []}
            onChange={(storageGuides) => setContent({ ...content, storageGuides })}
            onTemplatesChange={(storageGuideTemplates) =>
              setContent({ ...content, storageGuideTemplates })
            }
            onUpload={uploadImage}
          />
        )}

        {activeSection === "guide-templates" && (
          <GuideTemplatesAdminSection
            eatingGuideTemplates={content.eatingGuideTemplates ?? []}
            storageGuideTemplates={content.storageGuideTemplates ?? []}
            onChange={(patch) => setContent({ ...content, ...patch })}
          />
        )}

        {activeSection === "faq" && (
          <>
            {content.faqItems.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-border p-4 space-y-3">
                <Field
                  label={`질문 ${index + 1}`}
                  value={item.question}
                  onChange={(value) => {
                    const faqItems = [...content.faqItems];
                    faqItems[index] = { ...item, question: value };
                    setContent({ ...content, faqItems });
                  }}
                />
                <TextArea
                  label="답변"
                  value={item.answer}
                  onChange={(value) => {
                    const faqItems = [...content.faqItems];
                    faqItems[index] = { ...item, answer: value };
                    setContent({ ...content, faqItems });
                  }}
                />
              </div>
            ))}
            <Field
              label="FAQ 하단 제목"
              value={content.pageContent.faqFooterTitle}
              onChange={(value) =>
                setContent({
                  ...content,
                  pageContent: { ...content.pageContent, faqFooterTitle: value },
                })
              }
            />
            <Field
              label="FAQ 하단 안내"
              value={content.pageContent.faqFooterText}
              onChange={(value) =>
                setContent({
                  ...content,
                  pageContent: { ...content.pageContent, faqFooterText: value },
                })
              }
            />
          </>
        )}

        {activeSection === "search-analytics" && <SearchAnalyticsPanel />}

        {activeSection === "visitor-analytics" && <VisitorAnalyticsPanel />}
      </div>

      {activeSection !== "search-analytics" && activeSection !== "visitor-analytics" && (
      <div className="sticky bottom-4 mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-black px-4 py-3 text-[16px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? "저장 중..." : "변경사항 저장"}
        </button>
        {message && <p className="text-[14px] text-body">{message}</p>}
      </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium text-black">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border px-4 py-3 text-[15px] outline-none focus:border-black"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium text-black">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-xl border border-border px-4 py-3 text-[15px] outline-none focus:border-black"
      />
    </label>
  );
}

function HomeSectionOrderEditor({
  order,
  onChange,
}: {
  order?: HomeSectionId[];
  onChange: (order: HomeSectionId[]) => void;
}) {
  const normalizedOrder = normalizeHomeSectionOrder(order);

  const moveSection = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= normalizedOrder.length) return;

    const nextOrder = [...normalizedOrder];
    [nextOrder[index], nextOrder[nextIndex]] = [
      nextOrder[nextIndex],
      nextOrder[index],
    ];
    onChange(nextOrder);
  };

  return (
    <div>
      <p className="mb-2 text-[14px] font-medium text-black">홈 섹션 순서</p>
      <p className="mb-3 text-[13px] text-body">
        위·아래 버튼으로 홈 화면에 표시되는 섹션 순서를 변경할 수 있습니다.
      </p>
      <div className="space-y-2">
        {normalizedOrder.map((sectionId, index) => (
          <div
            key={sectionId}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[12px] font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-[15px] text-black">
                {HOME_SECTION_LABELS[sectionId]}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveSection(index, -1)}
                className="rounded-lg border border-border px-3 py-1.5 text-[14px] text-black disabled:opacity-30"
                aria-label={`${HOME_SECTION_LABELS[sectionId]} 위로`}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === normalizedOrder.length - 1}
                onClick={() => moveSection(index, 1)}
                className="rounded-lg border border-border px-3 py-1.5 text-[14px] text-black disabled:opacity-30"
                aria-label={`${HOME_SECTION_LABELS[sectionId]} 아래로`}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageMediaUpload({
  label,
  mediaUrl,
  onUpload,
}: {
  label: string;
  mediaUrl?: string;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <MediaUploadField label={label} mediaUrl={mediaUrl} onUpload={onUpload} />
    </div>
  );
}

function MediaUploadField({
  label,
  mediaUrl,
  onUpload,
}: {
  label: string;
  mediaUrl?: string;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-[14px] font-medium text-black">{label}</span>
      <p className="mb-3 text-[12px] text-body">
        사진(JPG, PNG, WEBP), GIF, 동영상(MP4, WEBM, MOV) 업로드 가능
      </p>
      {mediaUrl &&
        (isVideoMedia(mediaUrl) ? (
          <video
            src={mediaUrl}
            controls
            playsInline
            className="mb-2 h-40 w-full rounded-xl bg-black object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl} alt={label} className="mb-2 h-40 w-full rounded-xl object-cover" />
        ))}
      <input
        type="file"
        accept="image/*,video/*,.gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
        }}
        className="block w-full text-[14px] text-body"
      />
    </div>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ContactInfo } from "@/lib/types";
import { cn, formatPhoneForTel } from "@/lib/utils";
import { trackMenuClick } from "@/lib/analytics-client";

type NavIconType = "home" | "notice" | "store" | "inquiry";

type NavItem =
  | { type: "link"; href: string; label: string; icon: NavIconType }
  | { type: "external"; href: string; label: string; icon: NavIconType }
  | { type: "modal"; label: string; icon: NavIconType };

const NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/", label: "홈", icon: "home" },
  { type: "link", href: "/notice", label: "공지사항", icon: "notice" },
  {
    type: "external",
    href: "https://smartstore.naver.com/ph_youngnam",
    label: "스토어",
    icon: "store",
  },
  { type: "modal", label: "문의", icon: "inquiry" },
];

export default function ActionBar({ contactInfo }: { contactInfo: ContactInfo }) {
  const pathname = usePathname();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="하단 메뉴"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-6 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.type === "link" &&
              (item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href));

            const className = cn(
              "flex flex-col items-center gap-1 px-4 py-1 active:opacity-60",
              isActive ? "text-[#5a6a7e]" : "text-[#8a95a8]"
            );

            if (item.type === "external") {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackMenuClick(item.label, pathname)}
                  className={className}
                >
                  <NavIcon type={item.icon} />
                  <span className="text-[11px]">{item.label}</span>
                </a>
              );
            }

            if (item.type === "modal") {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    trackMenuClick(item.label, pathname);
                    setIsInquiryOpen(true);
                  }}
                  className={className}
                >
                  <NavIcon type={item.icon} />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => trackMenuClick(item.label, pathname)}
                className={className}
              >
                <NavIcon type={item.icon} />
                <span className="text-[11px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <InquiryModal
        open={isInquiryOpen}
        contactInfo={contactInfo}
        onClose={() => setIsInquiryOpen(false)}
      />
    </>
  );
}

function InquiryModal({
  open,
  contactInfo,
  onClose,
}: {
  open: boolean;
  contactInfo: ContactInfo;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        className="relative w-full max-w-sm rounded-3xl bg-white px-6 py-10 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-black active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 id="inquiry-modal-title" className="sr-only">
          문의하기
        </h2>

        <p className="mb-6 text-center text-[15px] text-black">
          버튼을 누르면 연결됩니다.
        </p>

        <div className="flex flex-col items-center gap-3">
          <a
            href={`tel:${formatPhoneForTel(contactInfo.phone)}`}
            className="inline-flex items-center justify-center rounded-full border border-black bg-white px-8 py-3 text-[16px] font-medium text-black active:opacity-60"
          >
            유선문의
          </a>
          <a
            href={contactInfo.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-black bg-white px-8 py-3 text-[16px] font-medium text-black active:opacity-60"
          >
            카카오톡 문의
          </a>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ type }: { type: NavIconType }) {
  switch (type) {
    case "home":
      return <HomeIcon />;
    case "notice":
      return <NoticeIcon />;
    case "store":
      return <StoreIcon />;
    case "inquiry":
      return <InquiryIcon />;
  }
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 20v-5h4v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NoticeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10v4l12 4V6L4 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 10v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 14v2.5a1.5 1.5 0 01-1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1.2 11H7.2L6 8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6a3 3 0 016 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InquiryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 9a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavIconType = "home" | "truck" | "box" | "chat" | "faq";

const NAV_ITEMS: { href: string; label: string; icon: NavIconType }[] = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/tracking", label: "배송", icon: "truck" },
  { href: "/guide/storage", label: "보관", icon: "box" },
  { href: "/contact", label: "문의", icon: "chat" },
  { href: "/faq", label: "FAQ", icon: "faq" },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2 pb-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1",
                isActive ? "text-black" : "text-body active:text-black"
              )}
            >
              <NavIcon type={item.icon} filled={isActive} />
              <span
                className={cn(
                  "text-[11px]",
                  isActive ? "font-bold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ type, filled }: { type: NavIconType; filled?: boolean }) {
  switch (type) {
    case "home":
      return <HomeIcon filled={filled} />;
    case "truck":
      return <TruckIcon filled={filled} />;
    case "box":
      return <BoxIcon filled={filled} />;
    case "chat":
      return <ChatIcon filled={filled} />;
    case "faq":
      return <FaqIcon filled={filled} />;
  }
}

function HomeIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      {filled ? (
        <path d="M12 5.7L5 11.5V20h5v-5h4v5h5v-8.5L12 5.7z" fill="currentColor" />
      ) : (
        <path
          d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </svg>
  );
}

function TruckIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="8" width="12" height="8" rx="1" stroke="currentColor" strokeWidth={filled ? 2.2 : 1.8} />
      <path d="M14 10h4l2 3v3h-6v-6z" stroke="currentColor" strokeWidth={filled ? 2.2 : 1.8} />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" />
      <circle cx="17" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BoxIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={filled ? 2.2 : 1.8} />
      <path d="M4 10h16M9 6V4h6v2" stroke="currentColor" strokeWidth={filled ? 2.2 : 1.8} />
    </svg>
  );
}

function ChatIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5h14a1 1 0 011 1v8a1 1 0 01-1 1H9l-4 3V6a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth={filled ? 2.2 : 1.8}
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function FaqIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={filled ? 2.2 : 1.8} />
      <path
        d="M9.5 9a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3.5"
        stroke="currentColor"
        strokeWidth={filled ? 2.2 : 1.8}
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" />
    </svg>
  );
}

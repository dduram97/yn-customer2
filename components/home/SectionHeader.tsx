"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackMenuClick } from "@/lib/analytics-client";

interface SectionHeaderProps {
  title: string;
  href: string;
}

export default function SectionHeader({ title, href }: SectionHeaderProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      onClick={() => trackMenuClick(title, pathname)}
      className="flex items-center gap-1 text-[18px] font-bold text-black active:opacity-70"
    >
      {title}
      <span aria-hidden className="text-body">
        ›
      </span>
    </Link>
  );
}

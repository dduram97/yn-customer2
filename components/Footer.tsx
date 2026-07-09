import type { SiteConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FooterProps {
  siteConfig: SiteConfig;
  className?: string;
}

export default function Footer({ siteConfig, className }: FooterProps) {
  return (
    <footer
      className={cn(
        "mt-auto border-t border-border bg-white px-4 py-6",
        className
      )}
    >
      <div className="mx-auto max-w-lg text-center">
        <p className="text-[15px] font-bold text-black">{siteConfig.brandName}</p>
        <p className="mt-1 text-[13px] text-body">{siteConfig.tagline}</p>
      </div>
    </footer>
  );
}

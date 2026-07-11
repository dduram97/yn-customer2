import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImagePlaceholderProps {
  label?: string;
  src?: string;
  alt?: string;
  aspectRatio?: "hero" | "section" | "square";
  className?: string;
  compact?: boolean;
  /** When true, use Next.js image optimizer for remote URLs (home/list cards). */
  optimized?: boolean;
  sizes?: string;
}

const ASPECT_CLASSES = {
  hero: "aspect-[4/3]",
  section: "aspect-[16/10]",
  square: "aspect-square",
};

export default function ImagePlaceholder({
  label = "이미지 준비 중",
  src,
  alt,
  aspectRatio = "section",
  className,
  compact = false,
  optimized = false,
  sizes = "(max-width: 512px) 100vw, 512px",
}: ImagePlaceholderProps) {
  if (src) {
    const isRemote = /^https?:\/\//i.test(src) || src.startsWith("/uploads/");

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-placeholder",
          ASPECT_CLASSES[aspectRatio],
          className
        )}
      >
        <Image
          key={src}
          src={src}
          alt={alt ?? label}
          fill
          unoptimized={isRemote && !optimized}
          className="object-cover"
          sizes={sizes}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-placeholder",
        !className?.includes("border-0") && "border border-dashed border-border",
        ASPECT_CLASSES[aspectRatio],
        className
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center">
        {!compact && <ImageIcon />}
        <span
          className={cn(
            "font-medium text-body",
            compact ? "text-[10px] leading-tight" : "text-sm"
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function ImageIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      className="text-black/15"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
      <path d="M3 16l5-4 4 3 3-2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

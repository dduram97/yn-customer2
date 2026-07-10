import { isVideoMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

interface MediaPlaceholderProps {
  label?: string;
  src?: string;
  alt?: string;
  aspectRatio?: "hero" | "section" | "square";
  className?: string;
  compact?: boolean;
  /** When src is video, mute playback (default false). */
  muted?: boolean;
}

const ASPECT_CLASSES = {
  hero: "aspect-[4/3]",
  section: "aspect-[16/10]",
  square: "aspect-square",
};

/**
 * CMS media renderer. Uses native <img>/<video> (not next/image) so
 * newly uploaded Supabase URLs (JPG/PNG/WEBP/GIF/MOV) always show immediately
 * without the image optimizer cache.
 */
export default function MediaPlaceholder({
  label = "미디어 준비 중",
  src,
  alt,
  aspectRatio = "section",
  className,
  compact = false,
  muted = false,
}: MediaPlaceholderProps) {
  if (src && isVideoMedia(src)) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-placeholder",
          ASPECT_CLASSES[aspectRatio],
          className
        )}
      >
        <video
          key={`${src}-${muted ? "muted" : "sound"}`}
          src={src}
          className="absolute inset-0 h-full w-full object-cover"
          controls
          playsInline
          muted={muted}
          preload="metadata"
          aria-label={alt ?? label}
        />
      </div>
    );
  }

  if (src) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-placeholder",
          ASPECT_CLASSES[aspectRatio],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={src}
          src={src}
          alt={alt ?? label}
          className="absolute inset-0 h-full w-full object-cover"
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

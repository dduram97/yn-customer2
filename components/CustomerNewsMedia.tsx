"use client";

import { useRef, useState } from "react";
import type { CustomerNewsMediaType } from "@/lib/customer-news";
import { inferMediaTypeFromUrl, resolveMediaDisplaySrc } from "@/lib/media";
import { cn } from "@/lib/utils";

interface CustomerNewsMediaProps {
  url: string | null | undefined;
  mediaType?: CustomerNewsMediaType | null;
  alt?: string;
  /** Thumbnail for lists / admin cards. */
  variant?: "hero" | "thumb";
  className?: string;
}

function NewsVideoPreview({
  url,
  alt,
  variant,
}: {
  url: string;
  alt?: string;
  variant: "hero" | "thumb";
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (variant === "thumb") {
    return (
      <video
        src={`${url}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={alt}
      />
    );
  }

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative block h-full w-full overflow-hidden"
        aria-label={alt ? `${alt} 영상 재생` : "영상 재생"}
      >
        <video
          src={`${url}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-active:bg-black/45">
          <span className="rounded-full bg-white px-5 py-2 text-[15px] font-bold text-black shadow-sm">
            ▶ 재생
          </span>
        </span>
      </button>
    );
  }

  return (
    <video
      ref={videoRef}
      src={url}
      controls
      playsInline
      autoPlay
      className="h-full w-full bg-black object-contain"
      aria-label={alt}
    />
  );
}

/**
 * Customer news media: still image, auto-playing GIF, or video preview.
 */
export default function CustomerNewsMedia({
  url,
  mediaType,
  alt = "",
  variant = "hero",
  className,
}: CustomerNewsMediaProps) {
  const displaySrc = resolveMediaDisplaySrc(url?.trim() || undefined);
  if (!displaySrc) return null;

  const type = inferMediaTypeFromUrl(displaySrc, mediaType ?? undefined);
  const shell =
    variant === "thumb"
      ? "relative h-full w-full overflow-hidden bg-placeholder"
      : "relative aspect-[16/10] w-full overflow-hidden bg-placeholder";

  return (
    <div className={cn(shell, className)}>
      {type === "video" ? (
        <div className="absolute inset-0">
          <NewsVideoPreview url={displaySrc} alt={alt} variant={variant} />
        </div>
      ) : (
        // GIF uses native img so animation plays; still images likewise.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

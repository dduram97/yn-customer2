"use client";

import { useRef, useState } from "react";
import { inferMediaTypeFromUrl } from "@/lib/media";
import type { GuideMediaType } from "@/lib/types";

export interface GuideMediaBlockViewModel {
  url: string;
  mediaType: GuideMediaType;
  label?: string;
}

interface GuideMediaBlockProps {
  media: GuideMediaBlockViewModel;
}

function VideoMediaPlayer({ url, label }: { url: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative block w-full overflow-hidden"
        aria-label={label ? `${label} 영상 재생` : "영상 재생"}
      >
        <video
          src={`${url}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="aspect-video w-full bg-black object-cover"
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
      className="aspect-video w-full bg-black"
    />
  );
}

export default function GuideMediaBlock({ media }: GuideMediaBlockProps) {
  if (!media.url) {
    return null;
  }

  const mediaType = inferMediaTypeFromUrl(media.url, media.mediaType);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      {mediaType === "video" ? (
        <VideoMediaPlayer url={media.url} label={media.label} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={media.label ?? ""}
          className="w-full object-cover"
        />
      )}
      {media.label ? (
        <p className="px-4 py-3 text-[14px] text-body">{media.label}</p>
      ) : null}
    </div>
  );
}

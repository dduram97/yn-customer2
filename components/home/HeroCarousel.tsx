"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { isVideoMedia } from "@/lib/media";
import type { HeroSlide } from "@/lib/types";

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const AUTO_ADVANCE_MS = 10000;
const FADE_MS = 700;

type LayerId = 0 | 1;

function getNextIndex(current: number, total: number) {
  return (current + 1) % total;
}

/** First paint: HAVE_CURRENT_DATA / canplay — not full canplaythrough buffer. */
function waitForVideoReady(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const onReady = () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      resolve();
    };
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
  });
}

async function prepareVideo(video: HTMLVideoElement, src: string) {
  const currentSrc = video.currentSrc || video.getAttribute("src") || "";
  if (!currentSrc.endsWith(src)) {
    video.src = src;
    video.load();
  }

  await waitForVideoReady(video);
  video.currentTime = 0;
  await video.play().catch(() => {});
}

interface PersistentLayerProps {
  slide: HeroSlide | undefined;
  opacity: number;
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onImageReady: () => void;
}

function PersistentLayer({
  slide,
  opacity,
  isActive,
  videoRef,
  onImageReady,
}: PersistentLayerProps) {
  const imageUrl = slide?.imageUrl ?? "";
  const isVideo = Boolean(imageUrl && isVideoMedia(imageUrl));
  const imageReadyRef = useRef(false);

  useEffect(() => {
    imageReadyRef.current = false;
  }, [imageUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");

    if (isActive) {
      video.play().catch(() => {});
      return;
    }

    video.pause();
  }, [isActive, isVideo, videoRef]);

  return (
    <div
      className="absolute inset-0 transition-opacity ease-in-out"
      style={{
        opacity,
        transitionDuration: `${FADE_MS}ms`,
        zIndex: opacity > 0 ? 1 : 0,
      }}
      aria-hidden={opacity === 0}
    >
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 h-full w-full object-cover pointer-events-none",
          isVideo ? "block" : "hidden"
        )}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        disablePictureInPicture
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        tabIndex={-1}
        aria-hidden
        // SSR may emit camelCase attrs (playsInline/autoPlay); the browser
        // normalizes to lowercase — suppress to avoid false hydration warnings.
        suppressHydrationWarning
      />

      {!isVideo && imageUrl ? (
        <Image
          src={imageUrl}
          alt={slide?.imageLabel || slide?.title || "배너 이미지"}
          fill
          priority={isActive}
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 512px"
          onLoad={() => {
            if (imageReadyRef.current) return;
            imageReadyRef.current = true;
            onImageReady();
          }}
          onLoadingComplete={() => {
            if (imageReadyRef.current) return;
            imageReadyRef.current = true;
            onImageReady();
          }}
        />
      ) : null}

      {!imageUrl ? (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm font-medium text-body">
          {slide?.imageLabel}
        </div>
      ) : null}
    </div>
  );
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const videoRef0 = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<LayerId>(0);
  const [layerSlides, setLayerSlides] = useState<[number, number]>([0, 0]);
  const [layerOpacity, setLayerOpacity] = useState<[number, number]>([1, 0]);
  const transitioningRef = useRef(false);

  const getVideoRef = useCallback(
    (layer: LayerId) => (layer === 0 ? videoRef0 : videoRef1),
    []
  );

  const applySlideToLayer = useCallback(
    async (layer: LayerId, slideIndex: number) => {
      const slide = slides[slideIndex];
      if (!slide?.imageUrl) return;

      if (isVideoMedia(slide.imageUrl)) {
        const video = getVideoRef(layer).current;
        if (!video) return;
        await prepareVideo(video, slide.imageUrl);
        return;
      }

      const imageSrc = slide.imageUrl;
      await new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = imageSrc;
      });
    },
    [getVideoRef, slides]
  );

  const crossfadeTo = useCallback(
    async (targetIndex: number) => {
      if (
        transitioningRef.current ||
        slides.length <= 1 ||
        targetIndex === activeIndex
      ) {
        return;
      }

      transitioningRef.current = true;
      const inactiveLayer: LayerId = activeLayer === 0 ? 1 : 0;

      setLayerSlides((prev) => {
        const next: [number, number] = [...prev];
        next[inactiveLayer] = targetIndex;
        return next;
      });

      try {
        await applySlideToLayer(inactiveLayer, targetIndex);

        const backOpacity: [number, number] =
          inactiveLayer === 0 ? [1, 0] : [0, 1];

        setLayerOpacity(backOpacity);

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, FADE_MS);
        });

        const previousLayer = activeLayer;
        setActiveLayer(inactiveLayer);
        setActiveIndex(targetIndex);
        setLayerOpacity(backOpacity);

        const previousVideo = getVideoRef(previousLayer).current;
        previousVideo?.pause();
      } finally {
        transitioningRef.current = false;
      }
    },
    [activeIndex, activeLayer, applySlideToLayer, getVideoRef, slides.length]
  );

  const goToNext = useCallback(() => {
    void crossfadeTo(getNextIndex(activeIndex, slides.length));
  }, [activeIndex, crossfadeTo, slides.length]);

  const goToIndex = useCallback(
    (index: number) => {
      void crossfadeTo(index);
    },
    [crossfadeTo]
  );

  // Mount: load/play the first (active) slide only. Next slides prepare in crossfadeTo.
  useEffect(() => {
    if (slides.length === 0) return;

    const firstSlide = slides[0];
    if (!firstSlide?.imageUrl || !isVideoMedia(firstSlide.imageUrl)) return;

    const video = videoRef0.current;
    if (!video) return;

    void prepareVideo(video, firstSlide.imageUrl);
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      goToNext();
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [goToNext, slides.length]);

  const currentSlide = slides[activeIndex];
  if (!currentSlide) return null;

  const layer0Slide = slides[layerSlides[0]];
  const layer1Slide = slides[layerSlides[1]];

  return (
    <section aria-label="제철 수산물 배너" className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-placeholder">
        <div className="relative min-h-[200px] w-full">
          <PersistentLayer
            slide={layer0Slide}
            opacity={layerOpacity[0]}
            isActive={activeLayer === 0}
            videoRef={videoRef0}
            onImageReady={() => {}}
          />
          <PersistentLayer
            slide={layer1Slide}
            opacity={layerOpacity[1]}
            isActive={activeLayer === 1}
            videoRef={videoRef1}
            onImageReady={() => {}}
          />

          {currentSlide.title ? (
            <p className="absolute left-5 top-1/2 z-10 max-w-[70%] -translate-y-1/2 text-[22px] font-bold leading-tight text-black">
              {currentSlide.title}
            </p>
          ) : null}

          <button
            type="button"
            onClick={goToNext}
            aria-label="다음 배너 보기"
            className="absolute inset-0 z-[2] active:opacity-95"
          />

          <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${index + 1}번째 배너`}
                aria-current={index === activeIndex}
                onClick={() => goToIndex(index)}
                className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-4 bg-black" : "w-1.5 bg-black/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

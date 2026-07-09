import ImagePlaceholder from "@/components/ImagePlaceholder";
import { isVideoMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

interface MediaPlaceholderProps {
  label?: string;
  src?: string;
  alt?: string;
  aspectRatio?: "hero" | "section" | "square";
  className?: string;
  compact?: boolean;
}

const ASPECT_CLASSES = {
  hero: "aspect-[4/3]",
  section: "aspect-[16/10]",
  square: "aspect-square",
};

export default function MediaPlaceholder({
  label = "미디어 준비 중",
  src,
  alt,
  aspectRatio = "section",
  className,
  compact = false,
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
          src={src}
          className="absolute inset-0 h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
          aria-label={alt ?? label}
        />
      </div>
    );
  }

  return (
    <ImagePlaceholder
      label={label}
      src={src}
      alt={alt}
      aspectRatio={aspectRatio}
      className={className}
      compact={compact}
    />
  );
}

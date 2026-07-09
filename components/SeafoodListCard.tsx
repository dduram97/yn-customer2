import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";

interface SeafoodListCardProps {
  name: string;
  imageLabel: string;
  imageUrl?: string;
  subtitle: string;
  href: string;
}

export default function SeafoodListCard({
  name,
  imageLabel,
  imageUrl,
  subtitle,
  href,
}: SeafoodListCardProps) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-colors active:opacity-90"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl">
          <ImagePlaceholder
            label={imageLabel}
            src={imageUrl}
            aspectRatio="square"
            compact
            className="h-full rounded-none border-0"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-body">{subtitle}</p>
          <p className="mt-1 text-[18px] font-bold text-black">{name}</p>
        </div>

        <span className="shrink-0 text-[22px] text-body" aria-hidden>
          ›
        </span>
      </div>
    </Link>
  );
}

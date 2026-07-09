import Link from "next/link";
import SectionTitle from "./SectionTitle";
import ImagePlaceholder from "./ImagePlaceholder";

interface ContentSectionProps {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  imageLabel?: string;
}

export default function ContentSection({
  number,
  title,
  subtitle,
  description,
  href,
  imageLabel,
}: ContentSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle number={number} title={title} />

      <Link href={href} className="block active:opacity-90">
        <ImagePlaceholder label={imageLabel ?? `${title} 이미지`} />
      </Link>

      <div className="space-y-3">
        <p className="text-[17px] font-bold leading-snug text-navy">
          {subtitle}
        </p>
        <p className="text-[16px] leading-relaxed text-body">{description}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[16px] font-semibold text-ocean"
        >
          자세히 보기
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

import ImagePlaceholder from "./ImagePlaceholder";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function HeroSection({
  title,
  subtitle,
  description,
}: HeroSectionProps) {
  return (
    <section className="space-y-5">
      <ImagePlaceholder
        label="영남수산 대표 이미지"
        aspectRatio="hero"
        className="rounded-none border-x-0 -mx-4 w-[calc(100%+2rem)]"
      />

      <div className="space-y-3">
        <h2 className="text-[24px] font-bold leading-snug text-navy">
          {title}
        </h2>
        <p className="text-[17px] font-bold text-navy/80">{subtitle}</p>
        <p className="text-[16px] leading-relaxed text-body">{description}</p>
      </div>
    </section>
  );
}

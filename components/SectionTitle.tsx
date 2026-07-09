interface SectionTitleProps {
  number: number;
  title: string;
}

export default function SectionTitle({ number, title }: SectionTitleProps) {
  return (
    <h2 className="text-[22px] font-bold leading-snug text-navy">
      {number}. {title}
    </h2>
  );
}

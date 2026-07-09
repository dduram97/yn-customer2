interface BrandHeaderProps {
  brandName: string;
  subtitle: string;
}

export default function BrandHeader({ brandName, subtitle }: BrandHeaderProps) {
  return (
    <header className="mt-4">
      <h1 className="text-[12px] font-bold tracking-tight text-black">{brandName}</h1>
      <p className="mt-2 text-[26px] font-bold leading-tight text-black">{subtitle}</p>
    </header>
  );
}

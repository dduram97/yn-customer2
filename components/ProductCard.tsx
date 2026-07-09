import Link from "next/link";
import Card from "./Card";

interface ProductCardProps {
  title: string;
  description: string;
  href: string;
  emoji: string;
}

export default function ProductCard({
  title,
  description,
  href,
  emoji,
}: ProductCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <span className="text-3xl">{emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-navy">{title}</h3>
            <p className="mt-1 text-sm text-navy/60">{description}</p>
          </div>
          <span className="text-navy/30 text-xl">›</span>
        </div>
      </Card>
    </Link>
  );
}

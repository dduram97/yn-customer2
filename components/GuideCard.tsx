import Link from "next/link";
import Card from "./Card";

interface GuideCardProps {
  name: string;
  emoji: string;
  summary: string;
  href: string;
}

export default function GuideCard({
  name,
  emoji,
  summary,
  href,
}: GuideCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ivory text-2xl">
            {emoji}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-navy">{name}</h3>
            <p className="mt-0.5 text-sm text-navy/60">{summary}</p>
          </div>
          <span className="text-navy/30 text-xl">›</span>
        </div>
      </Card>
    </Link>
  );
}

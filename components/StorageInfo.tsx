import Card from "./Card";
import type { StorageGuide } from "@/lib/types";

interface StorageInfoProps {
  guide: StorageGuide;
}

export default function StorageInfo({ guide }: StorageInfoProps) {
  return (
    <Card className="space-y-4 border-0 bg-surface p-0 shadow-none">
      <p className="text-[16px] font-bold text-black">{guide.summary}</p>

      <div className="divide-y divide-border">
        <DetailRow label="보관 방법" value={guide.storageMethod} />
        <DetailRow label="냉장/냉동" value={guide.temperature} />
        <DetailRow label="권장 온도" value={guide.recommendedTemp} />
        <DetailRow label="보관 기간" value={guide.shelfLife} />
        <DetailRow label="해동 방법" value={guide.thawingMethod} />
      </div>

      <div className="rounded-xl bg-placeholder px-4 py-4">
        <p className="text-[15px] font-bold text-black">주의사항</p>
        <ul className="mt-2 space-y-1.5">
          {guide.cautions.map((caution) => (
            <li key={caution} className="text-[15px] text-body">
              · {caution}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-3 first:pt-0">
      <span className="w-24 shrink-0 text-[15px] text-body">{label}</span>
      <span className="text-[16px] text-black">{value}</span>
    </div>
  );
}

import Card from "./Card";
import type { EatingGuide } from "@/lib/types";

interface EatingGuideProps {
  guide: EatingGuide;
}

export default function EatingGuideCard({ guide }: EatingGuideProps) {
  return (
    <Card className="space-y-4 border-0 bg-surface p-0 shadow-none">
      <p className="text-[16px] font-bold text-black">{guide.summary}</p>

      <div className="divide-y divide-border">
        <DetailRow label="손질 방법" value={guide.preparation} />
        <DetailRow label="해동 방법" value={guide.thawing} />
        <DetailRow label="먹는 방법" value={guide.eatingMethod} />
      </div>

      <div>
        <p className="text-[15px] font-bold text-black">추천 조합</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {guide.recommendedPairing.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-white px-3 py-1 text-[14px] text-black"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[15px] font-bold text-black">맛있게 먹는 순서</p>
        <ol className="mt-2 space-y-2">
          {guide.eatingOrder.map((step, index) => (
            <li key={step} className="flex gap-3 text-[16px] text-black">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
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

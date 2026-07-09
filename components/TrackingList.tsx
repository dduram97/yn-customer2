import { DELIVERY_STEPS, getStepIndex } from "@/lib/utils";
import type { TrackingData } from "@/lib/types";

interface TrackingListProps {
  data: TrackingData;
}

export default function TrackingList({ data }: TrackingListProps) {
  const currentIndex = getStepIndex(data.step);

  return (
    <div className="divide-y divide-border border-t border-border">
      <TrackingRow label="송장번호" value={data.trackingNumber} />
      <TrackingRow label="배송상태" value={data.status} />
      <TrackingRow label="현재위치" value={data.location} />
      <div className="py-4">
        <p className="text-[16px] font-medium text-black">배송이력</p>
        <ul className="mt-4 space-y-3">
          {DELIVERY_STEPS.map((step, index) => {
            const isDone = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <li
                key={step.key}
                className={`flex items-center gap-3 text-[16px] ${
                  isDone ? "text-black" : "text-body"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-black text-white"
                      : isDone
                        ? "bg-black/10 text-black"
                        : "bg-placeholder text-body"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                <span className={isCurrent ? "font-bold" : ""}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <TrackingRow label="택배사" value={data.courier} />
      <TrackingRow label="상품명" value={data.productName} />
    </div>
  );
}

function TrackingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="shrink-0 text-[16px] text-black">{label}</span>
      <span className="text-right text-[16px] font-medium text-black">
        {value}
      </span>
    </div>
  );
}

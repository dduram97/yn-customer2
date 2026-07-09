import Card from "./Card";
import StatusBadge from "./StatusBadge";
import DeliveryStepIndicator from "./DeliveryStep";
import type { TrackingData } from "@/lib/types";

interface TrackingCardProps {
  data: TrackingData;
}

export default function TrackingCard({ data }: TrackingCardProps) {
  return (
    <Card className="space-y-5 shadow-none">
      <div>
        <p className="text-[14px] text-body">배송 상품</p>
        <h2 className="mt-1 text-[20px] font-bold text-navy">
          {data.productName}
        </h2>
        <div className="mt-3">
          <StatusBadge status={data.status} step={data.step} />
        </div>
      </div>

      <DeliveryStepIndicator currentStep={data.step} />

      <div className="space-y-3 border-t border-border pt-4">
        <InfoRow label="택배사" value={data.courier} />
        <InfoRow label="운송장번호" value={data.trackingNumber} />
        <InfoRow label="현재 위치" value={data.location} />
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[15px] text-body shrink-0">{label}</span>
      <span className="text-[16px] font-medium text-navy text-right">
        {value}
      </span>
    </div>
  );
}

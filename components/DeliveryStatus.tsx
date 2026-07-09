import Card from "./Card";
import StatusBadge from "./StatusBadge";
import DeliveryStepIndicator from "./DeliveryStep";
import type { TrackingData } from "@/lib/types";

interface DeliveryStatusProps {
  data: TrackingData;
}

export default function DeliveryStatus({ data }: DeliveryStatusProps) {
  return (
    <div className="space-y-4">
      <Card className="text-center">
        <StatusBadge status={data.status} step={data.step} />
        <p className="mt-2 text-sm text-navy/50">{data.location}</p>
      </Card>
      <DeliveryStepIndicator currentStep={data.step} />
    </div>
  );
}

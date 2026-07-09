import { cn } from "@/lib/utils";
import type { DeliveryStep } from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  step: DeliveryStep;
}

const STEP_COLORS: Record<DeliveryStep, string> = {
  preparing: "bg-amber-100 text-amber-800",
  picked_up: "bg-blue-100 text-blue-800",
  in_transit: "bg-ocean/10 text-ocean",
  delivered: "bg-green-100 text-green-800",
};

export default function StatusBadge({ status, step }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-4 py-1.5 text-sm font-semibold",
        STEP_COLORS[step]
      )}
    >
      {status}
    </span>
  );
}

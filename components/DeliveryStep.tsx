import { cn, DELIVERY_STEPS, getStepIndex } from "@/lib/utils";
import type { DeliveryStep } from "@/lib/types";

interface DeliveryStepProps {
  currentStep: DeliveryStep;
}

export default function DeliveryStepIndicator({
  currentStep,
}: DeliveryStepProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {DELIVERY_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="relative flex w-full items-center justify-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "absolute right-1/2 h-0.5 w-full",
                      index <= currentIndex ? "bg-ocean" : "bg-ivory-dark"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors",
                    isCompleted
                      ? "bg-ocean text-white"
                      : "bg-ivory-dark text-navy/40",
                    isCurrent && "ring-4 ring-ocean/20"
                  )}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
              </div>
              <p
                className={cn(
                  "mt-2 text-center text-xs leading-tight",
                  isCurrent
                    ? "font-bold text-ocean"
                    : isCompleted
                      ? "text-navy/70"
                      : "text-navy/40"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

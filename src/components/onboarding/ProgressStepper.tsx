import { Check } from "lucide-react";

import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProgressStepperProps = {
  steps: string[];
  currentStep: number;
};

function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  const percent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between sm:hidden">
        <span className="text-xs font-medium text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-xs font-medium text-foreground">{steps[currentStep]}</span>
      </div>
      <Progress value={percent} className="sm:hidden">
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>

      <div className="hidden items-center sm:flex">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    isCompleted && "border-accent bg-accent text-accent-foreground",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="size-3.5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    isCompleted ? "bg-accent" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ProgressStepper };

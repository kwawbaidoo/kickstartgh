"use client";

import { useState, type ReactNode } from "react";

import { ProgressStepper } from "@/components/onboarding/ProgressStepper";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ExportActions } from "@/components/reports/ExportActions";
import { Button } from "@/components/ui/button";
import type { ExportFormat } from "@/config/reports";
import type { ReportTable } from "@/lib/reports";

const wizardSteps = ["Filters", "Columns", "Preview"];

type ReportWizardProps = {
  filtersSlot: ReactNode;
  columnsSlot: ReactNode;
  table: ReportTable;
  filename: string;
  title: string;
  onExport?: (format: ExportFormat) => void;
  shareSlot?: ReactNode;
};

function ReportWizard({
  filtersSlot,
  columnsSlot,
  table,
  filename,
  title,
  onExport,
  shareSlot,
}: ReportWizardProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper steps={wizardSteps} currentStep={step} />

      {step === 0 && filtersSlot}
      {step === 1 && columnsSlot}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <ReportPreview table={table} />
          <ExportActions table={table} filename={filename} title={title} onExport={onExport} />
          {shareSlot}
        </div>
      )}

      <div className="flex items-center justify-between print:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < wizardSteps.length - 1 && (
          <Button type="button" onClick={() => setStep((s) => Math.min(wizardSteps.length - 1, s + 1))}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

export { ReportWizard };

"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ExportActions } from "@/components/reports/ExportActions";
import type { ExportDataType } from "@/config/settings";
import type { ExportFormat } from "@/config/reports";
import type { ReportTable } from "@/lib/reports";

type ExportCardProps = {
  dataType: ExportDataType;
  label: string;
  description: string;
  icon: LucideIcon;
  table: ReportTable;
  onExport?: (format: ExportFormat) => void;
};

function ExportCard({ label, description, icon: Icon, table, onExport }: ExportCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
        </div>
        <ExportActions table={table} filename={label.toLowerCase().replace(/\s+/g, "-")} title={label} onExport={onExport} />
      </CardContent>
    </Card>
  );
}

export { ExportCard };

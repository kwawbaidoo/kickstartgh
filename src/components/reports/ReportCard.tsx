import { format } from "date-fns";
import { CalendarDays, ClipboardCheck, Trophy, Users, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { reportTypeLabels, type ReportType } from "@/config/reports";
import type { ReportHistoryEntry } from "@/store/reports-store";

const reportTypeIcon: Record<ReportType, LucideIcon> = {
  player: Users,
  team: Trophy,
  match: CalendarDays,
  attendance: ClipboardCheck,
};

type ReportCardProps = {
  entry: ReportHistoryEntry;
};

function ReportCard({ entry }: ReportCardProps) {
  const Icon = reportTypeIcon[entry.reportType];

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {entry.templateName ?? reportTypeLabels[entry.reportType]}
          </span>
          <span className="text-xs text-muted-foreground">
            {entry.format} · {format(new Date(entry.createdAt), "d MMM yyyy, HH:mm")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export { ReportCard };

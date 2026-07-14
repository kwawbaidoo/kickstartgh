import { ReportCard } from "@/components/reports/ReportCard";
import type { ReportHistoryEntry } from "@/store/reports-store";

type ReportHistoryProps = {
  entries: ReportHistoryEntry[];
  emptyMessage?: string;
};

function ReportHistory({ entries, emptyMessage = "No reports generated yet." }: ReportHistoryProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <ReportCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

export { ReportHistory };

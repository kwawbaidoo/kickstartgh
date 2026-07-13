import { FileBarChart } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Reports" description="Player, team, match, and attendance reports." />
      <EmptyState
        icon={FileBarChart}
        title="No reports generated yet."
        description="Build a report and export it as PDF, Excel, or share to WhatsApp."
        actionLabel="Generate report"
      />
    </div>
  );
}

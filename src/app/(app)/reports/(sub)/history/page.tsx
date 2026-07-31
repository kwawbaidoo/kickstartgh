"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ReportHistory } from "@/components/reports/ReportHistory";
import { useReportsStore } from "@/store/reports-store";

export default function ReportHistoryPage() {
  const history = useReportsStore((state) => state.history);

  return (
    <>
      <SectionHeader title="Report History" description="Every report you've generated, most recent first." />
      <ReportHistory entries={history} emptyMessage="No reports generated yet." />
    </>
  );
}

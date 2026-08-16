"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ReportHistory } from "@/components/reports/ReportHistory";
import { useReportsStore } from "@/store/reports-store";

export default function ReportHistoryPage() {
  const history = useReportsStore((state) => state.history);
  const hasHydrated = useReportsStore((state) => state.hasHydrated);
  const isLoading = useReportsStore((state) => state.isLoading);

  if (!hasHydrated || isLoading) {
    return <LoadingSkeleton className="h-64 w-full" />;
  }

  return (
    <>
      <SectionHeader title="Report History" description="Every report you've generated, most recent first." />
      <ReportHistory entries={history} emptyMessage="No reports generated yet." />
    </>
  );
}

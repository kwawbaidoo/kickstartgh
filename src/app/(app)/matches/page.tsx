import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function MatchesPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Matches" description="Fixtures, results, and match events." />
      <EmptyState
        icon={CalendarDays}
        title="No matches scheduled yet."
        description="Create your first fixture to start tracking results."
        actionLabel="Create match"
      />
    </div>
  );
}

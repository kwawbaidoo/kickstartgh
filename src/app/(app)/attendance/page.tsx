import { ClipboardCheck } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Attendance" description="Training and match attendance." />
      <EmptyState
        icon={ClipboardCheck}
        title="No attendance recorded yet."
        description="Track training and match attendance for your squad."
        actionLabel="Record attendance"
      />
    </div>
  );
}

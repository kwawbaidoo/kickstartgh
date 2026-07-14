"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TrainingCalendar } from "@/components/training/TrainingCalendar";
import { useAttendanceStore } from "@/store/attendance-store";

export default function TrainingCalendarPage() {
  const sessions = useAttendanceStore((state) => state.sessions);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Training Calendar" description="Upcoming, completed, and cancelled sessions." />
      <TrainingCalendar sessions={sessions} />
    </div>
  );
}

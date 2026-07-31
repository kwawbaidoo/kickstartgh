"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TrainingCalendar } from "@/components/training/TrainingCalendar";
import { useAttendanceStore } from "@/store/attendance-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonSessions } from "@/lib/seasons";

export default function TrainingCalendarPage() {
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const sessions = getSeasonSessions(useAttendanceStore((state) => state.sessions), activeSeasonId);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Training Calendar" description="Upcoming, completed, and cancelled sessions." />
      <TrainingCalendar sessions={sessions} />
    </div>
  );
}

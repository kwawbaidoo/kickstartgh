import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import type { AttendanceSession, SessionStatus } from "@/mock/attendance";
import type { Player } from "@/mock/players";
import { getSessionAttendanceSummary } from "@/lib/training";
import { cn } from "@/lib/utils";

const statusDotClasses: Record<SessionStatus, string> = {
  upcoming: "bg-accent",
  completed: "bg-emerald-500",
  cancelled: "bg-muted-foreground",
};

type TrainingTimelineProps = {
  sessions: AttendanceSession[];
  players: Player[];
};

function TrainingTimeline({ sessions, players }: TrainingTimelineProps) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions to show.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {sessions.map((session) => {
        const summary = getSessionAttendanceSummary(session, players);
        return (
          <Link
            key={session.id}
            href={`/training/${session.id}`}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
          >
            <span className={cn("size-2 shrink-0 rounded-full", statusDotClasses[session.status])} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{session.title}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3" />
                {format(new Date(session.date), "d MMM yyyy")}
              </span>
            </div>
            {session.status === "completed" && (
              <span className="shrink-0 text-sm font-semibold text-foreground">
                {summary.attendancePercentage}%
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export { TrainingTimeline };

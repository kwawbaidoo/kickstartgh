"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import type { AttendanceSession, SessionStatus } from "@/mock/attendance";
import { trainingFocusIcon } from "@/config/training";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const statusBadgeClasses: Record<SessionStatus, string> = {
  upcoming: "bg-accent text-accent-foreground",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  cancelled: "bg-muted text-muted-foreground",
};

type TrainingCardProps = {
  session: AttendanceSession;
  attendanceRate?: number;
};

function TrainingCard({ session, attendanceRate }: TrainingCardProps) {
  const FocusIcon = session.focus ? trainingFocusIcon[session.focus] : null;

  return (
    <motion.div variants={fadeInUp}>
      <Link
        href={`/training/${session.id}`}
        className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:ring-foreground/20"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
            {FocusIcon && <FocusIcon className="size-3.5 shrink-0" />}
            {session.focus ?? "Training"}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
              statusBadgeClasses[session.status]
            )}
          >
            {session.status}
          </span>
        </div>

        <span className="truncate text-sm font-medium text-foreground">{session.title}</span>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {format(new Date(session.date), "d MMM yyyy")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {session.startTime}
          </span>
        </div>

        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{session.venue}</span>
        </span>

        {attendanceRate !== undefined && (
          <div className="mt-1 flex items-center justify-between rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs">
            <span className="text-muted-foreground">Attendance</span>
            <span className="font-semibold text-foreground">{attendanceRate}%</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export { TrainingCard };

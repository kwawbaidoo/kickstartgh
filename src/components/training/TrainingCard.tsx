"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import type { AttendanceSession } from "@/mock/attendance";
import { sessionStatusBadgeClasses, trainingFocusIcon } from "@/config/training";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
        className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-none dark:ring-foreground/10 dark:hover:ring-foreground/20"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 truncate text-[11px] font-medium text-muted-foreground">
            {FocusIcon && <FocusIcon className="size-3 shrink-0" />}
            {session.focus ?? "Training"}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize",
              sessionStatusBadgeClasses[session.status]
            )}
          >
            {session.status}
          </span>
        </div>

        <span className="truncate text-xs font-medium text-foreground">{session.title}</span>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {format(new Date(session.date), "d MMM yyyy")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {session.start_time}
          </span>
        </div>

        <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{session.venue}</span>
        </span>

        {attendanceRate !== undefined && (
          <div className="mt-1 flex items-center justify-between rounded-lg bg-muted/60 px-2 py-1 text-[11px]">
            <span className="text-muted-foreground">Attendance</span>
            <span className="font-semibold text-foreground">{attendanceRate}%</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export { TrainingCard };

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AttendanceSession, SessionStatus } from "@/mock/attendance";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week";

type TrainingCalendarProps = {
  sessions: AttendanceSession[];
};

const statusDotClasses: Record<SessionStatus, string> = {
  upcoming: "bg-accent",
  completed: "bg-emerald-500",
  cancelled: "bg-muted-foreground",
};

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function TrainingCalendar({ sessions }: TrainingCalendarProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(new Date());

  const rangeStart = view === "month" ? startOfWeek(startOfMonth(anchor)) : startOfWeek(anchor);
  const rangeEnd = view === "month" ? endOfWeek(endOfMonth(anchor)) : endOfWeek(anchor);
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const maxPerDay = view === "week" ? 3 : 2;

  function goPrevious() {
    setAnchor((prev) => (view === "month" ? subMonths(prev, 1) : subWeeks(prev, 1)));
  }

  function goNext() {
    setAnchor((prev) => (view === "month" ? addMonths(prev, 1) : addWeeks(prev, 1)));
  }

  function sessionsForDay(day: Date) {
    return sessions.filter((session) => isSameDay(new Date(session.date), day));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon-sm" onClick={goPrevious} aria-label="Previous">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-28 text-center text-sm font-medium text-foreground sm:min-w-36">
            {view === "month" ? format(anchor, "MMMM yyyy") : `Week of ${format(rangeStart, "d MMM")}`}
          </span>
          <Button type="button" variant="outline" size="icon-sm" onClick={goNext} aria-label="Next">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
        {weekdayLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const daySessions = sessionsForDay(day);
          const inCurrentPeriod = view === "week" || isSameMonth(day, anchor);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-1.5",
                view === "week" ? "min-h-24" : "min-h-16",
                !inCurrentPeriod && "opacity-40",
                isToday(day) && "bg-accent/15 ring-1 ring-accent"
              )}
            >
              <span className="text-xs font-medium text-foreground">{format(day, "d")}</span>
              <div className="flex w-full flex-col gap-0.5">
                {daySessions.slice(0, maxPerDay).map((session) => (
                  <Link
                    key={session.id}
                    href={`/training/${session.id}`}
                    className="flex items-center gap-1 truncate rounded bg-muted px-1 py-0.5 text-[9px] text-foreground"
                  >
                    <span
                      className={cn("size-1.5 shrink-0 rounded-full", statusDotClasses[session.status])}
                    />
                    <span className="truncate">{session.title}</span>
                  </Link>
                ))}
                {daySessions.length > maxPerDay && (
                  <span className="text-[9px] text-muted-foreground">
                    +{daySessions.length - maxPerDay} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { TrainingCalendar };

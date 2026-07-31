"use client";

import { useState } from "react";
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
import { TrainingCard } from "@/components/training/TrainingCard";
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
const MAX_DOTS_PER_DAY = 4;

function TrainingCalendar({ sessions }: TrainingCalendarProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const rangeStart = view === "month" ? startOfWeek(startOfMonth(anchor)) : startOfWeek(anchor);
  const rangeEnd = view === "month" ? endOfWeek(endOfMonth(anchor)) : endOfWeek(anchor);
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  // If the stored selection has scrolled out of view (via prev/next, or a
  // month<->week toggle), fall back to the anchor date rather than showing a
  // detail panel for a day that's no longer in the visible grid.
  const activeDate = days.some((day) => isSameDay(day, selectedDate)) ? selectedDate : anchor;

  function goPrevious() {
    setAnchor((prev) => (view === "month" ? subMonths(prev, 1) : subWeeks(prev, 1)));
  }

  function goNext() {
    setAnchor((prev) => (view === "month" ? addMonths(prev, 1) : addWeeks(prev, 1)));
  }

  function sessionsForDay(day: Date) {
    return sessions.filter((session) => isSameDay(new Date(session.date), day));
  }

  const selectedSessions = sessionsForDay(activeDate);

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

      <div className="grid grid-cols-7 gap-1 text-center text-[16px] font-medium text-muted-foreground">
        {weekdayLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const daySessions = sessionsForDay(day);
          const inCurrentPeriod = view === "week" || isSameMonth(day, anchor);
          const today = isToday(day);
          const selected = isSameDay(day, activeDate);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelectedDate(day)}
              aria-pressed={selected}
              aria-label={`${format(day, "EEEE, d MMMM")}${
                daySessions.length > 0 ? `, ${daySessions.length} session${daySessions.length > 1 ? "s" : ""}` : ", no sessions"
              }`}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors",
                view === "week" ? "min-h-10" : "min-h-10",
                !inCurrentPeriod && "opacity-40",
                selected
                  ? "bg-primary text-primary-foreground"
                  : today
                    ? "bg-accent/15 ring-1 ring-accent"
                    : "hover:bg-muted/60",
                selected && today && "ring-1 ring-accent ring-offset-1 ring-offset-background"
              )}
            >
              <span className="text-xs font-medium">{format(day, "d")}</span>
              {daySessions.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {daySessions.slice(0, MAX_DOTS_PER_DAY).map((session) => (
                    <span
                      key={session.id}
                      className={cn("size-1.5 shrink-0 rounded-full", statusDotClasses[session.status])}
                    />
                  ))}
                  {daySessions.length > MAX_DOTS_PER_DAY && (
                    <span className="text-[8px] leading-none opacity-80">
                      +{daySessions.length - MAX_DOTS_PER_DAY}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
        <span className="text-sm font-semibold text-foreground">
          {isToday(activeDate) ? "Today" : format(activeDate, "EEEE")} · {format(activeDate, "d MMMM yyyy")}
        </span>
        {selectedSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions scheduled for this day.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedSessions.map((session) => (
              <TrainingCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { TrainingCalendar };

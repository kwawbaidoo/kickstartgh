"use client";

import Link from "next/link";
import {
  CalendarPlus,
  FileBarChart,
  ListChecks,
  MessageCircle,
  Percent,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { TrainingCard } from "@/components/training/TrainingCard";
import { usePlayersStore } from "@/store/players-store";
import { useAttendanceStore } from "@/store/attendance-store";
import type { AttendanceRankingEntry } from "@/lib/attendance";
import { getTeamTrainingStats, getTodaySession, getUpcomingSessions } from "@/lib/training";
import { buttonVariants } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

function AttendeeRow({ entry }: { entry: AttendanceRankingEntry }) {
  return (
    <Link
      href={`/players/${entry.player.id}`}
      className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {getInitials(entry.player.fullName)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {entry.player.fullName}
      </span>
      <span className="shrink-0 text-sm font-semibold text-foreground">
        {entry.stats.attendancePercentage}%
      </span>
    </Link>
  );
}

export default function TrainingDashboardPage() {
  const players = usePlayersStore((state) => state.players);
  const sessions = useAttendanceStore((state) => state.sessions);

  const activePlayers = players.filter((player) => player.status === "Active");
  const todaySession = getTodaySession(sessions);
  const upcomingSessions = getUpcomingSessions(sessions).filter(
    (session) => session.id !== todaySession?.id
  );
  const teamStats = getTeamTrainingStats(activePlayers, sessions);

  const takeAttendanceHref = todaySession
    ? `/training/${todaySession.id}/attendance`
    : upcomingSessions[0]
      ? `/training/${upcomingSessions[0].id}/attendance`
      : "/training/new";
  const shareHref = todaySession
    ? `/training/${todaySession.id}`
    : upcomingSessions[0]
      ? `/training/${upcomingSessions[0].id}`
      : "/training/new";

  const quickActions = [
    { label: "Schedule Training", icon: <CalendarPlus />, href: "/training/new" },
    { label: "Take Attendance", icon: <ListChecks />, href: takeAttendanceHref },
    { label: "Attendance Report", icon: <FileBarChart />, href: "/reports/attendance" },
    { label: "Share Details", icon: <MessageCircle />, href: shareHref },
  ];

  const hasAnySessions = sessions.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Training"
        description="Schedule sessions, take attendance, and track commitment."
        action={
          <Link href="/training/calendar" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View Calendar
          </Link>
        }
      />

      {!hasAnySessions ? (
        <EmptyState
          title="No training sessions scheduled yet."
          description="Create your first training session."
          actionLabel="Schedule Training"
          actionHref="/training/new"
        />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <SectionHeader title="Team Overview" />
            <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatisticCard title="Team Attendance" value={`${teamStats.teamAttendancePercentage}%`} icon={<Percent />} />
              <StatisticCard
                title="Most Committed"
                value={teamStats.mostCommitted[0]?.player.fullName.split(" ")[0] ?? "—"}
                icon={<TrendingUp />}
              />
              <StatisticCard
                title="Needs Attention"
                value={teamStats.lowestAttendance[0]?.player.fullName.split(" ")[0] ?? "—"}
                icon={<TrendingDown />}
              />
              <StatisticCard title="Active Squad" value={activePlayers.length} icon={<Users />} />
            </Stagger>
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader title="Quick Actions" />
            <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {quickActions.map((action) => (
                <QuickActionCard key={action.label} {...action} />
              ))}
            </Stagger>
          </section>

          {todaySession && (
            <section className="flex flex-col gap-3">
              <SectionHeader title="Today's Session" />
              <div className="max-w-md">
                <TrainingCard session={todaySession} />
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <SectionHeader title="Upcoming Sessions" />
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other sessions scheduled yet.</p>
            ) : (
              <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <TrainingCard key={session.id} session={session} />
                ))}
              </Stagger>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className="flex flex-col gap-2">
              <SectionHeader title="Top Attendees" />
              {teamStats.mostCommitted.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {teamStats.mostCommitted.map((entry) => (
                    <AttendeeRow key={entry.player.id} entry={entry} />
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <SectionHeader title="Frequently Absent" />
              {teamStats.lowestAttendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {teamStats.lowestAttendance.map((entry) => (
                    <AttendeeRow key={entry.player.id} entry={entry} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

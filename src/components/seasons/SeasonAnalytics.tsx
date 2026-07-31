"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsBreakdownChart } from "@/components/dashboard/ResultsBreakdownChart";
import { AttackDefenceChart } from "@/components/dashboard/AttackDefenceChart";
import { AttendanceChart } from "@/components/training/AttendanceChart";
import type { AttendanceSession } from "@/mock/attendance";
import type { Match } from "@/mock/matches";
import type { Player } from "@/mock/players";
import { getMonthlyGoals, getPlayerMatchStats, getTeamStats } from "@/lib/matches";
import { getMonthlyAverages } from "@/lib/training";
import { getAttendanceRanking } from "@/lib/attendance";
import { getRecentForm, getSquadAvailability } from "@/lib/seasons";
import { cn, getInitials } from "@/lib/utils";

const formBadgeClasses: Record<string, string> = {
  win: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  draw: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  loss: "bg-destructive/10 text-destructive",
};

const formLetter: Record<string, string> = { win: "W", draw: "D", loss: "L" };

type SeasonAnalyticsProps = {
  seasonId: string;
  players: Player[];
  matches: Match[];
  sessions: AttendanceSession[];
};

function SeasonAnalytics({ seasonId, players, matches, sessions }: SeasonAnalyticsProps) {
  const teamStats = getTeamStats(matches);
  const monthlyGoals = getMonthlyGoals(matches);
  const monthlyAttendance = getMonthlyAverages(sessions);
  const recentForm = getRecentForm(matches, 5);
  const availability = getSquadAvailability(players, seasonId);

  const scorers = players
    .map((player) => ({ player, stats: getPlayerMatchStats(player.id, matches) }))
    .filter((entry) => entry.stats.goals > 0)
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 5);

  const assisters = players
    .map((player) => ({ player, stats: getPlayerMatchStats(player.id, matches) }))
    .filter((entry) => entry.stats.assists > 0)
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 5);

  const attendanceRanking = getAttendanceRanking(players, sessions, matches).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Form</CardTitle>
        </CardHeader>
        <CardContent>
          {recentForm.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed matches yet.</p>
          ) : (
            <div className="flex gap-2">
              {recentForm.map((result, index) => (
                <span
                  key={index}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                    formBadgeClasses[result]
                  )}
                >
                  {formLetter[result]}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Results Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsBreakdownChart wins={teamStats.wins} draws={teamStats.draws} losses={teamStats.losses} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attacks vs Defence (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <AttackDefenceChart data={monthlyGoals} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={monthlyAttendance} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Scorers</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {scorers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals recorded yet.</p>
            ) : (
              scorers.map((entry) => (
                <Link
                  key={entry.player.id}
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
                    {entry.stats.goals}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Assists</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {assisters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assists recorded yet.</p>
            ) : (
              assisters.map((entry) => (
                <Link
                  key={entry.player.id}
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
                    {entry.stats.assists}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Committed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {attendanceRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not enough data yet.</p>
            ) : (
              attendanceRanking.map((entry) => (
                <Link
                  key={entry.player.id}
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
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Squad Availability</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Active</span>
            <span className="text-right font-semibold text-foreground">{availability.active}</span>
            <span className="text-muted-foreground">Injured</span>
            <span className="text-right font-semibold text-foreground">{availability.injured}</span>
            <span className="text-muted-foreground">Suspended</span>
            <span className="text-right font-semibold text-foreground">{availability.suspended}</span>
            <span className="text-muted-foreground">Other</span>
            <span className="text-right font-semibold text-foreground">
              {availability.loaned + availability.released}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { SeasonAnalytics };

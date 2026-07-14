import { format, isToday as isDateToday } from "date-fns";

import type { AttendanceSession, AttendanceStatus } from "@/mock/attendance";
import type { Player } from "@/mock/players";
import { getPlayerAttendanceStats, type AttendanceRankingEntry } from "@/lib/attendance";

export function getUpcomingSessions(sessions: AttendanceSession[]): AttendanceSession[] {
  return sessions
    .filter((session) => session.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getTodaySession(
  sessions: AttendanceSession[],
  referenceDate = new Date()
): AttendanceSession | undefined {
  const todayKey = format(referenceDate, "yyyy-MM-dd");
  return sessions.find((session) => session.date === todayKey && session.status !== "cancelled");
}

export function getCompletedSessions(sessions: AttendanceSession[]): AttendanceSession[] {
  return sessions
    .filter((session) => session.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getSessionsForDate(sessions: AttendanceSession[], date: Date): AttendanceSession[] {
  const key = format(date, "yyyy-MM-dd");
  return sessions.filter((session) => session.date === key);
}

// ---------------------------------------------------------------------------
// Player-level analytics
// ---------------------------------------------------------------------------

export type ConsecutiveCounts = {
  consecutivePresent: number;
  consecutiveAbsent: number;
};

export function getConsecutiveCounts(playerId: string, sessions: AttendanceSession[]): ConsecutiveCounts {
  const recorded = sessions
    .filter((session) => session.records[playerId])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let consecutivePresent = 0;
  for (const session of recorded) {
    const status = session.records[playerId];
    if (status === "present" || status === "late") consecutivePresent += 1;
    else break;
  }

  let consecutiveAbsent = 0;
  for (const session of recorded) {
    const status = session.records[playerId];
    if (status === "absent") consecutiveAbsent += 1;
    else break;
  }

  return { consecutivePresent, consecutiveAbsent };
}

// ---------------------------------------------------------------------------
// Session-level summary
// ---------------------------------------------------------------------------

export type SessionAttendanceSummary = {
  present: number;
  late: number;
  excused: number;
  injured: number;
  absent: number;
  unmarked: number;
  total: number;
  attendancePercentage: number;
};

export function getSessionAttendanceSummary(
  session: AttendanceSession,
  players: Player[]
): SessionAttendanceSummary {
  const activePlayers = players.filter((player) => player.status === "Active");
  let present = 0;
  let late = 0;
  let excused = 0;
  let injured = 0;
  let absent = 0;
  let unmarked = 0;

  for (const player of activePlayers) {
    const status = session.records[player.id];
    if (!status) unmarked += 1;
    else if (status === "present") present += 1;
    else if (status === "late") late += 1;
    else if (status === "excused") excused += 1;
    else if (status === "injured") injured += 1;
    else absent += 1;
  }

  const total = activePlayers.length;
  const marked = total - unmarked;
  const attendancePercentage = marked > 0 ? Math.round(((present + late * 0.5) / marked) * 100) : 0;

  return { present, late, excused, injured, absent, unmarked, total, attendancePercentage };
}

// ---------------------------------------------------------------------------
// Team-level analytics
// ---------------------------------------------------------------------------

export type MonthlyAttendance = { month: string; percentage: number };

export function getMonthlyAverages(sessions: AttendanceSession[]): MonthlyAttendance[] {
  const monthGroups = new Map<string, { sortKey: number; sessions: AttendanceSession[] }>();

  for (const session of sessions) {
    const date = new Date(session.date);
    const monthKey = format(date, "MMM yyyy");
    const sortKey = date.getFullYear() * 12 + date.getMonth();
    const existing = monthGroups.get(monthKey);
    if (existing) existing.sessions.push(session);
    else monthGroups.set(monthKey, { sortKey, sessions: [session] });
  }

  return Array.from(monthGroups.entries())
    .map(([month, { sortKey, sessions: monthSessions }]) => {
      let weightedPresent = 0;
      let totalRecords = 0;
      for (const session of monthSessions) {
        for (const status of Object.values(session.records)) {
          totalRecords += 1;
          if (status === "present") weightedPresent += 1;
          else if (status === "late") weightedPresent += 0.5;
        }
      }
      return {
        month,
        sortKey,
        percentage: totalRecords > 0 ? Math.round((weightedPresent / totalRecords) * 100) : 0,
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ month, percentage }) => ({ month, percentage }));
}

export type TeamTrainingStats = {
  teamAttendancePercentage: number;
  mostCommitted: AttendanceRankingEntry[];
  lowestAttendance: AttendanceRankingEntry[];
  monthlyAverages: MonthlyAttendance[];
};

export function getTeamTrainingStats(players: Player[], sessions: AttendanceSession[]): TeamTrainingStats {
  const completedSessions = getCompletedSessions(sessions);

  const ranking = players
    .map((player) => ({ player, stats: getPlayerAttendanceStats(player.id, completedSessions, []) }))
    .filter((entry) => entry.stats.totalSessions > 0)
    .sort((a, b) => b.stats.attendancePercentage - a.stats.attendancePercentage);

  const teamAttendancePercentage =
    ranking.length > 0
      ? Math.round(
          ranking.reduce((sum, entry) => sum + entry.stats.attendancePercentage, 0) / ranking.length
        )
      : 0;

  return {
    teamAttendancePercentage,
    mostCommitted: ranking.slice(0, 3),
    lowestAttendance: [...ranking].reverse().slice(0, 3),
    monthlyAverages: getMonthlyAverages(completedSessions),
  };
}

// ---------------------------------------------------------------------------
// History filters
// ---------------------------------------------------------------------------

export type TrainingHistoryFilters = {
  playerId: string | "All";
  status: AttendanceStatus | "All";
  dateFrom: string;
  dateTo: string;
};

export const defaultTrainingHistoryFilters: TrainingHistoryFilters = {
  playerId: "All",
  status: "All",
  dateFrom: "",
  dateTo: "",
};

export function filterTrainingHistory(
  sessions: AttendanceSession[],
  filters: TrainingHistoryFilters
): AttendanceSession[] {
  return getCompletedSessions(sessions).filter((session) => {
    if (filters.dateFrom && session.date < filters.dateFrom) return false;
    if (filters.dateTo && session.date > filters.dateTo) return false;

    if (filters.playerId !== "All") {
      const status = session.records[filters.playerId];
      if (!status) return false;
      if (filters.status !== "All" && status !== filters.status) return false;
      return true;
    }

    if (filters.status !== "All") {
      return Object.values(session.records).includes(filters.status);
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// WhatsApp messages
// ---------------------------------------------------------------------------

function formatTimeLabel(time: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutesStr.padStart(2, "0")} ${period}`;
}

export function buildTrainingReminderMessage(session: AttendanceSession, teamName: string): string {
  const sessionDate = new Date(session.date);
  const dateLabel = isDateToday(sessionDate) ? "Today" : format(sessionDate, "EEEE, d MMM");

  return [
    "⚽ Training Reminder",
    "",
    teamName,
    "",
    `${dateLabel}, ${formatTimeLabel(session.startTime)}`,
    "",
    `Venue: ${session.venue}`,
    "",
    "Please arrive 15 minutes early.",
  ].join("\n");
}

export function buildTrainingShareMessage(session: AttendanceSession, teamName: string): string {
  return [
    "⚽ Training Session",
    "",
    teamName,
    "",
    session.title,
    `${format(new Date(session.date), "EEEE, d MMM yyyy")}, ${formatTimeLabel(session.startTime)}–${formatTimeLabel(session.endTime)}`,
    `Venue: ${session.venue}`,
    ...(session.focus ? [`Focus: ${session.focus}`] : []),
  ].join("\n");
}

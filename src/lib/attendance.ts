import type { AttendanceSession } from "@/mock/attendance";
import type { Match } from "@/mock/matches";
import type { Player } from "@/mock/players";
import { getStartingPlayerIds } from "@/lib/matches";

export type PlayerAttendanceStats = {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  injuredCount: number;
  totalSessions: number;
  attendancePercentage: number;
};

export function getPlayerAttendanceStats(
  player_id: string,
  sessions: AttendanceSession[],
  matches: Match[]
): PlayerAttendanceStats {
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let injuredCount = 0;
  let totalSessions = 0;

  for (const session of sessions) {
    const status = session.records[player_id];
    if (!status) continue;
    totalSessions += 1;
    if (status === "present") presentCount += 1;
    else if (status === "absent") absentCount += 1;
    else if (status === "late") lateCount += 1;
    else if (status === "injured") injuredCount += 1;
    else excusedCount += 1;
  }

  for (const match of matches) {
    if (match.status !== "completed" || !match.lineup) continue;
    const inSquad =
      getStartingPlayerIds(match.lineup).includes(player_id) || match.lineup.substitutes.includes(player_id);
    totalSessions += 1;
    if (inSquad) presentCount += 1;
    else absentCount += 1;
  }

  const attendancePercentage =
    totalSessions > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100) : 0;

  return {
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    injuredCount,
    totalSessions,
    attendancePercentage,
  };
}

export type AttendanceRankingEntry = {
  player: Player;
  stats: PlayerAttendanceStats;
};

export function getAttendanceRanking(
  players: Player[],
  sessions: AttendanceSession[],
  matches: Match[]
): AttendanceRankingEntry[] {
  return players
    .map((player) => ({ player, stats: getPlayerAttendanceStats(player.id, sessions, matches) }))
    .filter((entry) => entry.stats.totalSessions > 0)
    .sort((a, b) => b.stats.attendancePercentage - a.stats.attendancePercentage);
}

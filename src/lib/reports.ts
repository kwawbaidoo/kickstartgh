import { format } from "date-fns";

import {
  attendanceReportColumns,
  matchReportColumns,
  playerReportColumns,
  teamReportColumns,
  type ReportColumn,
} from "@/config/reports";
import type { ActiveTeam } from "@/store/onboarding-store";
import type { Match, MatchStatus } from "@/mock/matches";
import type { AgeGroup } from "@/config/players";
import type { Player, PlayerStatus, Position } from "@/mock/players";
import type { AttendanceSession } from "@/mock/attendance";
import {
  getAttendanceRanking,
  getPeriodCutoff,
  getPlayerAttendanceStats,
  type AttendancePeriod,
} from "@/lib/attendance";
import { getPlayerMatchStats, getTeamStats } from "@/lib/matches";
import { getAgeGroup } from "@/lib/players";

export type ReportTable = {
  columns: ReportColumn[];
  rows: Record<string, string>[];
};

function selectColumns(catalog: ReportColumn[], selectedKeys: string[]): ReportColumn[] {
  return selectedKeys
    .map((key) => catalog.find((column) => column.key === key))
    .filter((column): column is ReportColumn => !!column);
}

const EMPTY = "—";

// ---------------------------------------------------------------------------
// Player report
// ---------------------------------------------------------------------------

export type PlayerReportFilters = {
  position: Position | "All";
  ageGroup: AgeGroup | "All";
  status: PlayerStatus | "All";
};

export const defaultPlayerReportFilters: PlayerReportFilters = {
  position: "All",
  ageGroup: "All",
  status: "All",
};

export function buildPlayerReportTable(
  players: Player[],
  matches: Match[],
  sessions: AttendanceSession[],
  filters: PlayerReportFilters,
  columnKeys: string[]
): ReportTable {
  const filtered = players.filter((player) => {
    if (filters.position !== "All" && player.position !== filters.position) return false;
    if (filters.status !== "All" && player.status !== filters.status) return false;
    if (filters.ageGroup !== "All" && getAgeGroup(player.dateOfBirth) !== filters.ageGroup) return false;
    return true;
  });

  const rows = filtered.map((player) => {
    const matchStats = getPlayerMatchStats(player.id, matches);
    const attendanceStats = getPlayerAttendanceStats(player.id, sessions, matches);
    const row: Record<string, string> = {
      fullName: player.fullName,
      nickname: player.nickname ?? EMPTY,
      dateOfBirth: format(new Date(player.dateOfBirth), "d MMM yyyy"),
      position: player.position,
      jerseyNumber: String(player.jerseyNumber),
      preferredFoot: player.preferredFoot,
      phone: player.phone ?? EMPTY,
      matchesPlayed: String(matchStats.matchesPlayed),
      goals: String(matchStats.goals),
      assists: String(matchStats.assists),
      yellowCards: String(matchStats.yellowCards),
      redCards: String(matchStats.redCards),
      attendance: `${attendanceStats.attendancePercentage}%`,
    };
    return row;
  });

  return { columns: selectColumns(playerReportColumns, columnKeys), rows };
}

// ---------------------------------------------------------------------------
// Team report
// ---------------------------------------------------------------------------

export function buildTeamReportTable(
  team: ActiveTeam,
  players: Player[],
  matches: Match[],
  columnKeys: string[]
): ReportTable {
  const stats = getTeamStats(matches);
  const findStaff = (role: string) =>
    team.staff.find((member) => member.role === role)?.fullName ?? EMPTY;

  const row: Record<string, string> = {
    name: team.name,
    region: team.region || EMPTY,
    homeGround: team.homeGround || EMPTY,
    headCoach: findStaff("headCoach"),
    assistantCoach: findStaff("assistantCoach"),
    captain: findStaff("captain"),
    playerCount: String(players.length),
    matchesPlayed: String(stats.played),
    wins: String(stats.wins),
    draws: String(stats.draws),
    losses: String(stats.losses),
    goalsFor: String(stats.goalsFor),
    goalsAgainst: String(stats.goalsAgainst),
    winPercentage: `${stats.winPercentage}%`,
  };

  return { columns: selectColumns(teamReportColumns, columnKeys), rows: [row] };
}

// ---------------------------------------------------------------------------
// Match report
// ---------------------------------------------------------------------------

export type MatchReportFilters = {
  status: MatchStatus | "All";
  competition: string | "All";
};

export const defaultMatchReportFilters: MatchReportFilters = {
  status: "All",
  competition: "All",
};

export function buildMatchReportTable(
  matches: Match[],
  playerNames: Record<string, string>,
  filters: MatchReportFilters,
  columnKeys: string[]
): ReportTable {
  const filtered = matches
    .filter((match) => {
      if (filters.status !== "All" && match.status !== filters.status) return false;
      if (filters.competition !== "All" && match.competition !== filters.competition) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rows = filtered.map((match) => {
    const scorers =
      match.events
        .filter((event) => event.type === "goal")
        .map((event) => (event.type === "goal" ? playerNames[event.playerId] ?? "Unknown" : ""))
        .join(", ") || EMPTY;

    const assists =
      match.events
        .filter((event) => event.type === "goal" && event.assistPlayerId)
        .map((event) =>
          event.type === "goal" && event.assistPlayerId
            ? playerNames[event.assistPlayerId] ?? "Unknown"
            : ""
        )
        .filter(Boolean)
        .join(", ") || EMPTY;

    const cards =
      match.events
        .filter((event) => event.type === "yellow_card" || event.type === "red_card")
        .map((event) =>
          event.type === "yellow_card" || event.type === "red_card"
            ? `${playerNames[event.playerId] ?? "Unknown"} (${event.type === "yellow_card" ? "Y" : "R"})`
            : ""
        )
        .join(", ") || EMPTY;

    const substitutions =
      match.events
        .filter((event) => event.type === "substitution")
        .map((event) =>
          event.type === "substitution"
            ? `${playerNames[event.playerInId] ?? "?"} ↔ ${playerNames[event.playerOutId] ?? "?"}`
            : ""
        )
        .join(", ") || EMPTY;

    const scoreline =
      match.status === "completed"
        ? `${match.teamScore}–${match.opponentScore}`
        : match.status === "cancelled"
          ? "Cancelled"
          : "Upcoming";

    const row: Record<string, string> = {
      opponent: match.opponent,
      competition: match.competition,
      date: format(new Date(match.date), "d MMM yyyy"),
      venue: match.venue,
      scoreline,
      scorers,
      assists,
      cards,
      substitutions,
      notes: match.notes ?? EMPTY,
    };
    return row;
  });

  return { columns: selectColumns(matchReportColumns, columnKeys), rows };
}

// ---------------------------------------------------------------------------
// Attendance report
// ---------------------------------------------------------------------------

export function buildAttendanceReportTable(
  players: Player[],
  sessions: AttendanceSession[],
  matches: Match[],
  period: AttendancePeriod,
  columnKeys: string[]
): ReportTable {
  const cutoff = getPeriodCutoff(period);
  const periodSessions = sessions.filter((session) => new Date(session.date) >= cutoff);
  const periodMatches = matches.filter((match) => new Date(match.date) >= cutoff);

  const ranking = getAttendanceRanking(players, periodSessions, periodMatches);

  const rows = ranking.map((entry, index) => {
    const row: Record<string, string> = {
      rank: String(index + 1),
      fullName: entry.player.fullName,
      attendancePercentage: `${entry.stats.attendancePercentage}%`,
      presentCount: String(entry.stats.presentCount),
      absentCount: String(entry.stats.absentCount),
      lateCount: String(entry.stats.lateCount),
    };
    return row;
  });

  return { columns: selectColumns(attendanceReportColumns, columnKeys), rows };
}

// ---------------------------------------------------------------------------
// WhatsApp share messages
// ---------------------------------------------------------------------------

export function buildTeamReportShareMessage(team: ActiveTeam, matches: Match[]): string {
  const stats = getTeamStats(matches);
  return [
    "⚽ Team Report",
    "",
    team.name,
    "",
    `Matches: ${stats.played}`,
    `Wins: ${stats.wins}`,
    `Draws: ${stats.draws}`,
    `Losses: ${stats.losses}`,
  ].join("\n");
}

export function buildPlayerReportShareMessage(player: Player, matches: Match[]): string {
  const stats = getPlayerMatchStats(player.id, matches);
  return [
    "⚽ Player Report",
    "",
    player.fullName,
    "",
    `Position: ${player.position}`,
    `Goals: ${stats.goals}`,
    `Assists: ${stats.assists}`,
  ].join("\n");
}

export function getMatchCompetitions(matches: Match[]): string[] {
  return Array.from(new Set(matches.map((match) => match.competition))).sort();
}

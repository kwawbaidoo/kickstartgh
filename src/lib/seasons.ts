import type { AttendanceSession } from "@/mock/attendance";
import type { Match, MatchResult } from "@/mock/matches";
import { getMatchResult } from "@/mock/matches";
import type { Player, PlayerStatus } from "@/mock/players";
import type { Season } from "@/mock/seasons";
import { getPlayerMatchStats, getTeamStats, type TeamStats } from "@/lib/matches";
import { getPlayerAttendanceStats } from "@/lib/attendance";
import { getSeasonRecord, getSeasonRoster } from "@/lib/players";

export function getActiveSeason(seasons: Season[]): Season | undefined {
  return seasons.find((season) => season.status === "active");
}

export function getSeasonMatches(matches: Match[], season_id: string): Match[] {
  return matches.filter((match) => match.season_id === season_id);
}

export function getSeasonSessions(sessions: AttendanceSession[], season_id: string): AttendanceSession[] {
  return sessions.filter((session) => session.season_id === season_id);
}

export type SeasonStats = TeamStats & {
  registeredPlayers: number;
  trainingSessions: number;
  attendancePercentage: number;
};

export function getSeasonStats(
  season: Season,
  players: Player[],
  matches: Match[],
  sessions: AttendanceSession[]
): SeasonStats {
  const seasonMatches = getSeasonMatches(matches, season.id);
  const seasonSessions = getSeasonSessions(sessions, season.id);
  const roster = getSeasonRoster(players, season.id);
  const teamStats = getTeamStats(seasonMatches);

  let presentWeight = 0;
  let totalRecords = 0;
  for (const session of seasonSessions) {
    if (session.status !== "completed") continue;
    for (const player of roster) {
      const status = session.records[player.id];
      if (!status) continue;
      totalRecords += 1;
      if (status === "present") presentWeight += 1;
      else if (status === "late") presentWeight += 0.5;
    }
  }
  const attendancePercentage = totalRecords > 0 ? Math.round((presentWeight / totalRecords) * 100) : 0;

  return {
    ...teamStats,
    registeredPlayers: roster.length,
    trainingSessions: seasonSessions.length,
    attendancePercentage,
  };
}

// ---------------------------------------------------------------------------
// Season Roster — Performance & Stats tab. Every number here is composed
// from the same match-event/attendance formulas the reports engine already
// uses (getPlayerMatchStats, getPlayerAttendanceStats), just scoped down to
// this season's matches/sessions first — nothing is stored or entered twice.
// ---------------------------------------------------------------------------

export type SeasonPlayerStats = {
  player: Player;
  jersey_number: number;
  status: PlayerStatus;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  attendancePercentage: number;
};

export function getSeasonPlayerStats(
  players: Player[],
  matches: Match[],
  sessions: AttendanceSession[],
  season_id: string
): SeasonPlayerStats[] {
  const roster = getSeasonRoster(players, season_id);
  const seasonMatches = getSeasonMatches(matches, season_id);
  const seasonSessions = getSeasonSessions(sessions, season_id);

  return roster.map((player) => {
    const record = getSeasonRecord(player, season_id);
    const matchStats = getPlayerMatchStats(player.id, seasonMatches);
    const attendanceStats = getPlayerAttendanceStats(player.id, seasonSessions, seasonMatches);
    return {
      player,
      jersey_number: record?.jersey_number ?? player.jersey_number,
      status: record?.status ?? player.status,
      matchesPlayed: matchStats.matchesPlayed,
      goals: matchStats.goals,
      assists: matchStats.assists,
      yellowCards: matchStats.yellowCards,
      redCards: matchStats.redCards,
      attendancePercentage: attendanceStats.attendancePercentage,
    };
  });
}

export type SeasonPlayerStatsSort =
  | "jersey_number"
  | "name"
  | "goals"
  | "assists"
  | "yellowCards"
  | "redCards"
  | "attendance";

export function sortSeasonPlayerStats(
  stats: SeasonPlayerStats[],
  sort: SeasonPlayerStatsSort
): SeasonPlayerStats[] {
  const sorted = [...stats];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.player.full_name.localeCompare(b.player.full_name));
    case "goals":
      return sorted.sort((a, b) => b.goals - a.goals);
    case "assists":
      return sorted.sort((a, b) => b.assists - a.assists);
    case "yellowCards":
      return sorted.sort((a, b) => b.yellowCards - a.yellowCards);
    case "redCards":
      return sorted.sort((a, b) => b.redCards - a.redCards);
    case "attendance":
      return sorted.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
    case "jersey_number":
    default:
      return sorted.sort((a, b) => a.jersey_number - b.jersey_number);
  }
}

/** Chronological last-N results for the Team Form Tracker, oldest first. */
export function getRecentForm(matches: Match[], count = 5): MatchResult[] {
  return [...matches]
    .filter((match) => match.status === "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-count)
    .map((match) => getMatchResult(match))
    .filter((result): result is MatchResult => result !== null);
}

export type SquadAvailability = {
  active: number;
  injured: number;
  suspended: number;
  loaned: number;
  released: number;
};

export function getSquadAvailability(players: Player[], season_id: string): SquadAvailability {
  const roster = getSeasonRoster(players, season_id);
  const availability: SquadAvailability = { active: 0, injured: 0, suspended: 0, loaned: 0, released: 0 };
  for (const player of roster) {
    const record = player.season_records.find((entry) => entry.season_id === season_id);
    switch (record?.status) {
      case "Active":
        availability.active += 1;
        break;
      case "Injured":
        availability.injured += 1;
        break;
      case "Suspended":
        availability.suspended += 1;
        break;
      case "Inactive":
      default:
        availability.released += 1;
        break;
    }
  }
  return availability;
}

// ---------------------------------------------------------------------------
// Report period filter — a season's own reports need a coarser set of
// ranges (week/month/quarter/half-season/full-season/custom) than the
// calendar-bucket picker built for the player timeline (lib/players.ts).
// ---------------------------------------------------------------------------

export type ReportPeriod = "week" | "month" | "quarter" | "halfSeason" | "fullSeason" | "custom";

export const reportPeriodOptions: ReportPeriod[] = [
  "week",
  "month",
  "quarter",
  "halfSeason",
  "fullSeason",
  "custom",
];

export const reportPeriodLabels: Record<ReportPeriod, string> = {
  week: "This week",
  month: "This month",
  quarter: "This quarter",
  halfSeason: "Half season",
  fullSeason: "Full season",
  custom: "Custom range",
};

export type DateRange = { start: Date; end: Date };

export function getReportDateRange(
  season: Season,
  period: ReportPeriod,
  customRange?: { start: string; end: string },
  referenceDate = new Date()
): DateRange {
  const seasonStart = new Date(season.start_date);
  const seasonEnd = new Date(season.end_date);

  if (period === "fullSeason") return { start: seasonStart, end: seasonEnd };
  if (period === "custom" && customRange) {
    return { start: new Date(customRange.start), end: new Date(customRange.end) };
  }
  if (period === "halfSeason") {
    const midpoint = new Date((seasonStart.getTime() + seasonEnd.getTime()) / 2);
    return referenceDate < midpoint
      ? { start: seasonStart, end: midpoint }
      : { start: midpoint, end: seasonEnd };
  }

  const end = referenceDate;
  const start = new Date(referenceDate);
  if (period === "week") start.setDate(start.getDate() - 7);
  else if (period === "month") start.setMonth(start.getMonth() - 1);
  else start.setMonth(start.getMonth() - 3);

  return { start: start < seasonStart ? seasonStart : start, end };
}

export function filterByDateRange<T extends { date: string }>(items: T[], range: DateRange): T[] {
  return items.filter((item) => {
    const date = new Date(item.date);
    return date >= range.start && date <= range.end;
  });
}

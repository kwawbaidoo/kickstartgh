import { format } from "date-fns";

import type { Formation, Match, MatchEvent, MatchStatus } from "@/mock/matches";
import { getMatchResult } from "@/mock/matches";
import { formationRows, rowYPosition } from "@/config/matches";

export type FormationSlot = { row: "FWD" | "MID" | "DEF" | "GK"; x: number; y: number };

export function getFormationSlots(formation: Formation): FormationSlot[] {
  const slots: FormationSlot[] = [];
  for (const { row, count } of formationRows[formation]) {
    for (let i = 0; i < count; i++) {
      slots.push({ row, x: ((i + 1) / (count + 1)) * 100, y: rowYPosition[row] });
    }
  }
  return slots;
}

export type PlayerMatchStats = {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};

export function getPlayerMatchStats(playerId: string, matches: Match[]): PlayerMatchStats {
  const completed = matches.filter((match) => match.status === "completed");

  let matchesPlayed = 0;
  let goals = 0;
  let assists = 0;
  let yellowCards = 0;
  let redCards = 0;

  for (const match of completed) {
    const startedOrSubbedOn =
      match.lineup?.startingXI.includes(playerId) ||
      match.events.some((event) => event.type === "substitution" && event.playerInId === playerId);
    if (startedOrSubbedOn) matchesPlayed += 1;

    for (const event of match.events) {
      if (event.type === "goal" && event.playerId === playerId) goals += 1;
      if (event.type === "goal" && event.assistPlayerId === playerId) assists += 1;
      if (event.type === "yellow_card" && event.playerId === playerId) yellowCards += 1;
      if (event.type === "red_card" && event.playerId === playerId) redCards += 1;
    }
  }

  return { matchesPlayed, goals, assists, yellowCards, redCards };
}

export type TeamStats = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  winPercentage: number;
  trend: "up" | "down" | null;
};

export function getTeamStats(matches: Match[]): TeamStats {
  const completed = matches.filter((match) => match.status === "completed");
  const results = completed.map((match) => getMatchResult(match));

  const wins = results.filter((result) => result === "win").length;
  const draws = results.filter((result) => result === "draw").length;
  const losses = results.filter((result) => result === "loss").length;
  const goalsFor = completed.reduce((sum, match) => sum + (match.teamScore ?? 0), 0);
  const goalsAgainst = completed.reduce((sum, match) => sum + (match.opponentScore ?? 0), 0);
  const played = completed.length;
  const winPercentage = played > 0 ? Math.round((wins / played) * 100) : 0;

  const recentForm = results.slice(-3);
  const earlierForm = results.slice(0, -3);
  let trend: TeamStats["trend"] = null;
  if (recentForm.length > 0 && earlierForm.length > 0) {
    const recentWinRate = recentForm.filter((result) => result === "win").length / recentForm.length;
    const earlierWinRate = earlierForm.filter((result) => result === "win").length / earlierForm.length;
    if (recentWinRate !== earlierWinRate) {
      trend = recentWinRate > earlierWinRate ? "up" : "down";
    }
  }

  return { played, wins, draws, losses, goalsFor, goalsAgainst, winPercentage, trend };
}

// ---------------------------------------------------------------------------
// Season performance (richer breakdown for the Matches page summary card)
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "flat" | null;

function compareTrend(recentValues: number[], earlierValues: number[]): TrendDirection {
  if (recentValues.length === 0 || earlierValues.length === 0) return null;
  const recentAvg = recentValues.reduce((sum, value) => sum + value, 0) / recentValues.length;
  const earlierAvg = earlierValues.reduce((sum, value) => sum + value, 0) / earlierValues.length;
  if (recentAvg === earlierAvg) return "flat";
  return recentAvg > earlierAvg ? "up" : "down";
}

function getSeasonLabel(completed: Match[]): string {
  if (completed.length === 0) return String(new Date().getFullYear());
  const years = completed.map((match) => new Date(match.date).getFullYear());
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}/${String(max).slice(-2)}`;
}

export type SeasonPerformance = {
  season: string;
  played: number;
  wins: number;
  winsPercentage: number;
  winsTrend: TrendDirection;
  losses: number;
  lossesPercentage: number;
  lossesTrend: TrendDirection;
  draws: number;
  drawsPercentage: number;
  drawsTrend: TrendDirection;
  goalsFor: number;
  goalsForAvg: number;
  goalsForTrend: TrendDirection;
  goalsAgainst: number;
  goalsAgainstAvg: number;
  goalsAgainstTrend: TrendDirection;
};

export function getSeasonPerformance(matches: Match[]): SeasonPerformance {
  const completed = [...matches]
    .filter((match) => match.status === "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const results = completed.map((match) => getMatchResult(match));
  const played = completed.length;

  const recentMatches = completed.slice(-3);
  const earlierMatches = completed.slice(0, -3);
  const recentResults = results.slice(-3);
  const earlierResults = results.slice(0, -3);

  const wins = results.filter((result) => result === "win").length;
  const losses = results.filter((result) => result === "loss").length;
  const draws = results.filter((result) => result === "draw").length;
  const goalsFor = completed.reduce((sum, match) => sum + (match.teamScore ?? 0), 0);
  const goalsAgainst = completed.reduce((sum, match) => sum + (match.opponentScore ?? 0), 0);

  const percentageOf = (count: number) => (played > 0 ? Math.round((count / played) * 100) : 0);
  const averageOf = (total: number) => (played > 0 ? Math.round((total / played) * 10) / 10 : 0);

  return {
    season: getSeasonLabel(completed),
    played,
    wins,
    winsPercentage: percentageOf(wins),
    winsTrend: compareTrend(
      recentResults.map((result) => (result === "win" ? 1 : 0)),
      earlierResults.map((result) => (result === "win" ? 1 : 0))
    ),
    losses,
    lossesPercentage: percentageOf(losses),
    lossesTrend: compareTrend(
      recentResults.map((result) => (result === "loss" ? 1 : 0)),
      earlierResults.map((result) => (result === "loss" ? 1 : 0))
    ),
    draws,
    drawsPercentage: percentageOf(draws),
    drawsTrend: compareTrend(
      recentResults.map((result) => (result === "draw" ? 1 : 0)),
      earlierResults.map((result) => (result === "draw" ? 1 : 0))
    ),
    goalsFor,
    goalsForAvg: averageOf(goalsFor),
    goalsForTrend: compareTrend(
      recentMatches.map((match) => match.teamScore ?? 0),
      earlierMatches.map((match) => match.teamScore ?? 0)
    ),
    goalsAgainst,
    goalsAgainstAvg: averageOf(goalsAgainst),
    goalsAgainstTrend: compareTrend(
      recentMatches.map((match) => match.opponentScore ?? 0),
      earlierMatches.map((match) => match.opponentScore ?? 0)
    ),
  };
}

export type MatchFilters = {
  search: string;
  competition: string | "All";
  homeAway: "All" | "Home" | "Away";
};

export const defaultMatchFilters: MatchFilters = {
  search: "",
  competition: "All",
  homeAway: "All",
};

export function getCompetitions(matches: Match[]): string[] {
  return Array.from(new Set(matches.map((match) => match.competition))).sort();
}

export function filterMatches(
  matches: Match[],
  status: MatchStatus,
  filters: MatchFilters
): Match[] {
  const query = filters.search.trim().toLowerCase();

  return matches
    .filter((match) => match.status === status)
    .filter((match) => {
      if (query) {
        const matchesQuery =
          match.opponent.toLowerCase().includes(query) ||
          match.competition.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      if (filters.competition !== "All" && match.competition !== filters.competition) return false;
      if (filters.homeAway === "Home" && !match.isHome) return false;
      if (filters.homeAway === "Away" && match.isHome) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function playerName(playerId: string, playerNames: Record<string, string>): string {
  return playerNames[playerId] ?? "Unknown player";
}

export function describeEvent(event: MatchEvent, playerNames: Record<string, string>): string {
  switch (event.type) {
    case "goal": {
      const scorer = playerName(event.playerId, playerNames);
      return event.assistPlayerId
        ? `${scorer} scored (assist: ${playerName(event.assistPlayerId, playerNames)})`
        : `${scorer} scored`;
    }
    case "yellow_card":
      return `${playerName(event.playerId, playerNames)} — yellow card`;
    case "red_card":
      return `${playerName(event.playerId, playerNames)} — red card`;
    case "substitution":
      return `${playerName(event.playerInId, playerNames)} on for ${playerName(event.playerOutId, playerNames)}`;
    case "injury":
      return `${playerName(event.playerId, playerNames)} — injury`;
    default:
      return "";
  }
}

export function buildFixtureShareMessage(match: Match, teamName: string): string {
  return [
    "⚽ Upcoming Fixture",
    "",
    `${teamName} vs ${match.opponent}`,
    "",
    `Competition: ${match.competition}`,
    `Venue: ${match.venue}`,
    `Kickoff: ${match.kickoffTime}`,
  ].join("\n");
}

export function buildResultShareMessage(
  match: Match,
  teamName: string,
  playerNames: Record<string, string>
): string {
  const scorers = match.events
    .filter((event) => event.type === "goal")
    .reduce<Record<string, number>>((acc, event) => {
      if (event.type !== "goal") return acc;
      const name = playerName(event.playerId, playerNames);
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});

  const scorerLines = Object.entries(scorers).map(([name, count]) => `${name} ${"⚽".repeat(count)}`);

  return [
    "⚽ Full Time",
    "",
    `${teamName} ${match.teamScore}–${match.opponentScore} ${match.opponent}`,
    "",
    ...(scorerLines.length > 0 ? ["Scorers:", "", ...scorerLines, ""] : []),
    `Competition: ${match.competition}`,
  ].join("\n");
}

export function buildLineupShareMessage(
  match: Match,
  teamName: string,
  playerNames: Record<string, string>
): string {
  if (!match.lineup) {
    return `${teamName} lineup for ${match.opponent} hasn't been set yet.`;
  }

  const names = match.lineup.startingXI.map((id) => {
    const name = playerName(id, playerNames);
    return id === match.lineup?.captainId ? `${name} (C)` : name;
  });

  return [
    `⚽ ${teamName} Starting XI`,
    "",
    `vs ${match.opponent}`,
    `Formation: ${match.lineup.formation}`,
    "",
    ...names,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Monthly goals for/against (Attacks vs Defence dashboard chart)
// ---------------------------------------------------------------------------

export type MonthlyGoals = { month: string; goalsFor: number; goalsAgainst: number };

export function getMonthlyGoals(matches: Match[]): MonthlyGoals[] {
  const completed = matches.filter((match) => match.status === "completed");
  const monthGroups = new Map<string, { sortKey: number; goalsFor: number; goalsAgainst: number }>();

  for (const match of completed) {
    const date = new Date(match.date);
    const monthKey = format(date, "MMM yyyy");
    const sortKey = date.getFullYear() * 12 + date.getMonth();
    const existing = monthGroups.get(monthKey);
    const goalsFor = match.teamScore ?? 0;
    const goalsAgainst = match.opponentScore ?? 0;
    if (existing) {
      existing.goalsFor += goalsFor;
      existing.goalsAgainst += goalsAgainst;
    } else {
      monthGroups.set(monthKey, { sortKey, goalsFor, goalsAgainst });
    }
  }

  return Array.from(monthGroups.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ month, goalsFor, goalsAgainst }) => ({ month: month.split(" ")[0], goalsFor, goalsAgainst }));
}

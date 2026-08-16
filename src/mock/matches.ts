import type { Slot } from "@/config/matches";

export type MatchStatus = "upcoming" | "completed" | "cancelled";

export type MatchType = "Friendly" | "League" | "Tournament" | "Knockout";

export type MatchResult = "win" | "draw" | "loss";

export type Formation = "4-4-2" | "4-3-3" | "3-5-2" | "5-3-2" | "3-4-3" | "4-2-3-1" | "4-5-1" | "3-4-1-2" | "3-4-2-1" | "5-4-1" | "5-2-3";

export type Lineup = {
  formation: Formation;
  /**
   * Keyed by pitch slot (see config/matches.ts's `formationLayouts`), not
   * array order — a player fills a specific slot (e.g. "CB1"), and which
   * slots exist depends on the formation. Use `getStartingPlayerIds`
   * (lib/matches.ts) when only the flat list of player ids is needed.
   */
  starting_xi: Partial<Record<Slot, string>>;
  substitutes: string[];
  captain_id?: string;
};

export type MatchEventType = "goal" | "yellow_card" | "red_card" | "substitution" | "injury";

export type MatchEvent =
  | { id: string; type: "goal"; minute: number; player_id: string; assist_player_id?: string }
  | { id: string; type: "yellow_card" | "red_card"; minute: number; player_id: string }
  | { id: string; type: "substitution"; minute: number; player_out_id: string; player_in_id: string }
  | { id: string; type: "injury"; minute: number; player_id: string };

/** Plain `Omit` collapses a discriminated union to its common fields; this distributes over each member instead. */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export type MatchEventInput = DistributiveOmit<MatchEvent, "id">;

export type Match = {
  id: string;
  team_id: string;
  season_id: string;
  opponent: string;
  competition: string;
  match_type: MatchType;
  venue: string;
  is_home: boolean;
  date: string;
  kickoff_time: string;
  referee?: string;
  notes?: string;
  poster?: string;
  status: MatchStatus;
  team_score?: number;
  opponent_score?: number;
  lineup: Lineup | null;
  events: MatchEvent[];
  created_at: string;
};

export const matches: Match[] = [];

export function getMatchesByTeam(team_id: string): Match[] {
  return matches.filter((match) => match.team_id === team_id);
}

export function getMatchResult(match: Match): MatchResult | null {
  if (match.status !== "completed" || match.team_score === undefined || match.opponent_score === undefined) {
    return null;
  }
  if (match.team_score > match.opponent_score) return "win";
  if (match.team_score < match.opponent_score) return "loss";
  return "draw";
}

export function getUpcomingMatches(team_id: string, matchList: Match[] = matches, limit?: number): Match[] {
  const sorted = matchList
    .filter((match) => match.team_id === team_id && match.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getUpcomingMatch(team_id: string, matchList: Match[] = matches): Match | undefined {
  return getUpcomingMatches(team_id, matchList)[0];
}

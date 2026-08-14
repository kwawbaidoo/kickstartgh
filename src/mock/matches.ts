import type { Slot } from "@/config/matches";
import { DEFAULT_SEASON_ID } from "@/mock/seasons";

export type MatchStatus = "upcoming" | "completed" | "cancelled";

export type MatchType = "Friendly" | "League" | "Tournament" | "Knockout";

export type MatchResult = "win" | "draw" | "loss";

export type Formation = "4-4-2" | "4-3-3" | "3-5-2" | "5-3-2" | "3-4-3" | "4-2-3-1" | "4-5-1" | "3-4-1-2" | "3-4-2-1" | "5-4-1" | "5-2-3";

/**
 * A bench official is either an existing staff member (looked up live by id, so
 * role/name edits in Settings/Team stay reflected) or a one-off addition for this
 * match only, since not every matchday helper is on the permanent staff roster.
 */
export type BenchOfficial =
  | { id: string; source: "staff"; staff_id: string }
  | { id: string; source: "adhoc"; full_name: string; role: string };

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
  bench_officials: BenchOfficial[];
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

const coreLineup: Lineup = {
  formation: "4-4-2",
  starting_xi: {
    GK: "player_004",
    LB: "player_009",
    CB1: "player_010",
    CB2: "player_011",
    RB: "player_012",
    LM: "player_002",
    CM1: "player_005",
    CM2: "player_013",
    RM: "player_014",
    ST1: "player_001",
    ST2: "player_007",
  },
  substitutes: ["player_008", "player_015", "player_016"],
  captain_id: "player_001",
  bench_officials: [
    { id: "bench_001", source: "adhoc", full_name: "Dr. Nana Yaw", role: "Team Physio" },
  ],
};

const seedMatches: Omit<Match, "season_id">[] = [
  {
    id: "match_001",
    team_id: "team_001",
    opponent: "Unity FC",
    competition: "Ellembelle District League",
    match_type: "League",
    venue: "Community Park",
    is_home: true,
    date: "2026-05-03",
    kickoff_time: "16:00",
    status: "completed",
    team_score: 2,
    opponent_score: 1,
    lineup: coreLineup,
    events: [
      { id: "evt_001", type: "goal", minute: 23, player_id: "player_001", assist_player_id: "player_013" },
      { id: "evt_002", type: "goal", minute: 68, player_id: "player_007", assist_player_id: "player_005" },
      { id: "evt_003", type: "yellow_card", minute: 55, player_id: "player_009" },
      { id: "evt_004", type: "substitution", minute: 80, player_out_id: "player_007", player_in_id: "player_016" },
    ],
    created_at: "2026-05-02T08:00:00Z",
  },
  {
    id: "match_002",
    team_id: "team_001",
    opponent: "Nzema Kotoko",
    competition: "Ellembelle District League",
    match_type: "League",
    venue: "Nzema Park",
    is_home: false,
    date: "2026-05-17",
    kickoff_time: "15:30",
    status: "completed",
    team_score: 1,
    opponent_score: 1,
    lineup: coreLineup,
    events: [
      { id: "evt_005", type: "goal", minute: 34, player_id: "player_001", assist_player_id: "player_014" },
      { id: "evt_006", type: "substitution", minute: 70, player_out_id: "player_002", player_in_id: "player_015" },
    ],
    created_at: "2026-05-16T08:00:00Z",
  },
  {
    id: "match_003",
    team_id: "team_001",
    opponent: "Axim Stars",
    competition: "Ellembelle District League",
    match_type: "League",
    venue: "Community Park",
    is_home: true,
    date: "2026-05-31",
    kickoff_time: "16:00",
    status: "completed",
    team_score: 3,
    opponent_score: 0,
    lineup: coreLineup,
    events: [
      { id: "evt_007", type: "goal", minute: 15, player_id: "player_001", assist_player_id: "player_013" },
      { id: "evt_008", type: "goal", minute: 50, player_id: "player_007", assist_player_id: "player_005" },
      { id: "evt_009", type: "goal", minute: 77, player_id: "player_002", assist_player_id: "player_014" },
      { id: "evt_010", type: "yellow_card", minute: 40, player_id: "player_010" },
      { id: "evt_011", type: "substitution", minute: 78, player_out_id: "player_005", player_in_id: "player_016" },
    ],
    created_at: "2026-05-30T08:00:00Z",
  },
  {
    id: "match_004",
    team_id: "team_001",
    opponent: "Half Assini United",
    competition: "Ellembelle District League",
    match_type: "League",
    venue: "Half Assini Park",
    is_home: false,
    date: "2026-06-14",
    kickoff_time: "15:00",
    referee: "Mr. Kwabena Sarfo",
    notes: "Tough away trip, went down to 10 men after the hour mark.",
    status: "completed",
    team_score: 0,
    opponent_score: 2,
    lineup: coreLineup,
    events: [{ id: "evt_012", type: "red_card", minute: 65, player_id: "player_011" }],
    created_at: "2026-06-13T08:00:00Z",
  },
  {
    id: "match_005",
    team_id: "team_001",
    opponent: "Bonsaso Youth FC",
    competition: "Regional Cup",
    match_type: "Tournament",
    venue: "Community Park",
    is_home: true,
    date: "2026-06-28",
    kickoff_time: "16:00",
    notes: "Cup quarter-final. Kojo Antwi scored a late winner off the bench.",
    status: "completed",
    team_score: 4,
    opponent_score: 2,
    lineup: coreLineup,
    events: [
      { id: "evt_013", type: "goal", minute: 10, player_id: "player_001", assist_player_id: "player_013" },
      { id: "evt_014", type: "goal", minute: 44, player_id: "player_001", assist_player_id: "player_014" },
      { id: "evt_015", type: "goal", minute: 58, player_id: "player_007", assist_player_id: "player_005" },
      { id: "evt_016", type: "yellow_card", minute: 30, player_id: "player_012" },
      { id: "evt_017", type: "substitution", minute: 60, player_out_id: "player_007", player_in_id: "player_015" },
      { id: "evt_018", type: "goal", minute: 88, player_id: "player_015" },
    ],
    created_at: "2026-06-27T08:00:00Z",
  },
  {
    id: "match_006",
    team_id: "team_001",
    opponent: "Sekondi Warriors",
    competition: "Regional Cup",
    match_type: "Tournament",
    venue: "Community Park",
    is_home: true,
    date: "2026-07-20",
    kickoff_time: "16:00",
    status: "upcoming",
    lineup: null,
    events: [],
    created_at: "2026-07-13T08:00:00Z",
  },
];

export const matches: Match[] = seedMatches.map((match) => ({
  ...match,
  season_id: DEFAULT_SEASON_ID,
}));

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

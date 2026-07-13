export type MatchStatus = "upcoming" | "completed" | "cancelled";

export type MatchType = "Friendly" | "League" | "Tournament" | "Knockout";

export type MatchResult = "win" | "draw" | "loss";

export type Formation = "4-4-2" | "4-3-3" | "3-5-2" | "5-3-2";

export type Lineup = {
  formation: Formation;
  /** Player ids, ordered FWD → MID → DEF → GK to match config/matches.ts's formationRows slot order. */
  startingXI: string[];
  substitutes: string[];
  captainId?: string;
};

export type MatchEventType = "goal" | "yellow_card" | "red_card" | "substitution" | "injury";

export type MatchEvent =
  | { id: string; type: "goal"; minute: number; playerId: string; assistPlayerId?: string }
  | { id: string; type: "yellow_card" | "red_card"; minute: number; playerId: string }
  | { id: string; type: "substitution"; minute: number; playerOutId: string; playerInId: string }
  | { id: string; type: "injury"; minute: number; playerId: string };

/** Plain `Omit` collapses a discriminated union to its common fields; this distributes over each member instead. */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export type MatchEventInput = DistributiveOmit<MatchEvent, "id">;

export type Match = {
  id: string;
  teamId: string;
  opponent: string;
  competition: string;
  matchType: MatchType;
  venue: string;
  isHome: boolean;
  date: string;
  kickoffTime: string;
  referee?: string;
  notes?: string;
  poster?: string;
  status: MatchStatus;
  teamScore?: number;
  opponentScore?: number;
  lineup: Lineup | null;
  events: MatchEvent[];
  createdAt: string;
};

const coreLineup: Lineup = {
  formation: "4-4-2",
  startingXI: [
    "player_001",
    "player_007",
    "player_002",
    "player_005",
    "player_013",
    "player_014",
    "player_009",
    "player_010",
    "player_011",
    "player_012",
    "player_004",
  ],
  substitutes: ["player_008", "player_015", "player_016"],
  captainId: "player_001",
};

export const matches: Match[] = [
  {
    id: "match_001",
    teamId: "team_001",
    opponent: "Unity FC",
    competition: "Ellembelle District League",
    matchType: "League",
    venue: "Community Park",
    isHome: true,
    date: "2026-05-03",
    kickoffTime: "16:00",
    status: "completed",
    teamScore: 2,
    opponentScore: 1,
    lineup: coreLineup,
    events: [
      { id: "evt_001", type: "goal", minute: 23, playerId: "player_001", assistPlayerId: "player_013" },
      { id: "evt_002", type: "goal", minute: 68, playerId: "player_007", assistPlayerId: "player_005" },
      { id: "evt_003", type: "yellow_card", minute: 55, playerId: "player_009" },
      { id: "evt_004", type: "substitution", minute: 80, playerOutId: "player_007", playerInId: "player_016" },
    ],
    createdAt: "2026-05-02T08:00:00Z",
  },
  {
    id: "match_002",
    teamId: "team_001",
    opponent: "Nzema Kotoko",
    competition: "Ellembelle District League",
    matchType: "League",
    venue: "Nzema Park",
    isHome: false,
    date: "2026-05-17",
    kickoffTime: "15:30",
    status: "completed",
    teamScore: 1,
    opponentScore: 1,
    lineup: coreLineup,
    events: [
      { id: "evt_005", type: "goal", minute: 34, playerId: "player_001", assistPlayerId: "player_014" },
      { id: "evt_006", type: "substitution", minute: 70, playerOutId: "player_002", playerInId: "player_015" },
    ],
    createdAt: "2026-05-16T08:00:00Z",
  },
  {
    id: "match_003",
    teamId: "team_001",
    opponent: "Axim Stars",
    competition: "Ellembelle District League",
    matchType: "League",
    venue: "Community Park",
    isHome: true,
    date: "2026-05-31",
    kickoffTime: "16:00",
    status: "completed",
    teamScore: 3,
    opponentScore: 0,
    lineup: coreLineup,
    events: [
      { id: "evt_007", type: "goal", minute: 15, playerId: "player_001", assistPlayerId: "player_013" },
      { id: "evt_008", type: "goal", minute: 50, playerId: "player_007", assistPlayerId: "player_005" },
      { id: "evt_009", type: "goal", minute: 77, playerId: "player_002", assistPlayerId: "player_014" },
      { id: "evt_010", type: "yellow_card", minute: 40, playerId: "player_010" },
      { id: "evt_011", type: "substitution", minute: 78, playerOutId: "player_005", playerInId: "player_016" },
    ],
    createdAt: "2026-05-30T08:00:00Z",
  },
  {
    id: "match_004",
    teamId: "team_001",
    opponent: "Half Assini United",
    competition: "Ellembelle District League",
    matchType: "League",
    venue: "Half Assini Park",
    isHome: false,
    date: "2026-06-14",
    kickoffTime: "15:00",
    referee: "Mr. Kwabena Sarfo",
    notes: "Tough away trip, went down to 10 men after the hour mark.",
    status: "completed",
    teamScore: 0,
    opponentScore: 2,
    lineup: coreLineup,
    events: [{ id: "evt_012", type: "red_card", minute: 65, playerId: "player_011" }],
    createdAt: "2026-06-13T08:00:00Z",
  },
  {
    id: "match_005",
    teamId: "team_001",
    opponent: "Bonsaso Youth FC",
    competition: "Regional Cup",
    matchType: "Tournament",
    venue: "Community Park",
    isHome: true,
    date: "2026-06-28",
    kickoffTime: "16:00",
    notes: "Cup quarter-final. Kojo Antwi scored a late winner off the bench.",
    status: "completed",
    teamScore: 4,
    opponentScore: 2,
    lineup: coreLineup,
    events: [
      { id: "evt_013", type: "goal", minute: 10, playerId: "player_001", assistPlayerId: "player_013" },
      { id: "evt_014", type: "goal", minute: 44, playerId: "player_001", assistPlayerId: "player_014" },
      { id: "evt_015", type: "goal", minute: 58, playerId: "player_007", assistPlayerId: "player_005" },
      { id: "evt_016", type: "yellow_card", minute: 30, playerId: "player_012" },
      { id: "evt_017", type: "substitution", minute: 60, playerOutId: "player_007", playerInId: "player_015" },
      { id: "evt_018", type: "goal", minute: 88, playerId: "player_015" },
    ],
    createdAt: "2026-06-27T08:00:00Z",
  },
  {
    id: "match_006",
    teamId: "team_001",
    opponent: "Sekondi Warriors",
    competition: "Regional Cup",
    matchType: "Tournament",
    venue: "Community Park",
    isHome: true,
    date: "2026-07-20",
    kickoffTime: "16:00",
    status: "upcoming",
    lineup: null,
    events: [],
    createdAt: "2026-07-13T08:00:00Z",
  },
];

export function getMatchesByTeam(teamId: string): Match[] {
  return matches.filter((match) => match.teamId === teamId);
}

export function getMatchResult(match: Match): MatchResult | null {
  if (match.status !== "completed" || match.teamScore === undefined || match.opponentScore === undefined) {
    return null;
  }
  if (match.teamScore > match.opponentScore) return "win";
  if (match.teamScore < match.opponentScore) return "loss";
  return "draw";
}

export function getUpcomingMatch(teamId: string, matchList: Match[] = matches): Match | undefined {
  return matchList
    .filter((match) => match.teamId === teamId && match.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

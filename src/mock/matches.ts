export type MatchStatus = "completed" | "upcoming";

export type MatchResult = "win" | "draw" | "loss";

export type Match = {
  id: string;
  teamId: string;
  opponent: string;
  competition: string;
  venue: string;
  date: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
};

export const matches: Match[] = [
  { id: "match_001", teamId: "team_001", opponent: "Unity FC", competition: "Ellembelle District League", venue: "Community Park", date: "2026-05-03", status: "completed", homeScore: 2, awayScore: 1 },
  { id: "match_002", teamId: "team_001", opponent: "Nzema Kotoko", competition: "Ellembelle District League", venue: "Nzema Park", date: "2026-05-17", status: "completed", homeScore: 1, awayScore: 1 },
  { id: "match_003", teamId: "team_001", opponent: "Axim Stars", competition: "Ellembelle District League", venue: "Community Park", date: "2026-05-31", status: "completed", homeScore: 3, awayScore: 0 },
  { id: "match_004", teamId: "team_001", opponent: "Half Assini United", competition: "Ellembelle District League", venue: "Half Assini Park", date: "2026-06-14", status: "completed", homeScore: 0, awayScore: 2 },
  { id: "match_005", teamId: "team_001", opponent: "Bonsaso Youth FC", competition: "Regional Cup", venue: "Community Park", date: "2026-06-28", status: "completed", homeScore: 4, awayScore: 2 },
  { id: "match_006", teamId: "team_001", opponent: "Sekondi Warriors", competition: "Regional Cup", venue: "Community Park", date: "2026-07-20", status: "upcoming" },
];

export function getMatchesByTeam(teamId: string): Match[] {
  return matches.filter((match) => match.teamId === teamId);
}

export function getMatchResult(match: Match): MatchResult | null {
  if (match.status !== "completed" || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }
  if (match.homeScore > match.awayScore) return "win";
  if (match.homeScore < match.awayScore) return "loss";
  return "draw";
}

export function getUpcomingMatch(teamId: string): Match | undefined {
  return matches
    .filter((match) => match.teamId === teamId && match.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

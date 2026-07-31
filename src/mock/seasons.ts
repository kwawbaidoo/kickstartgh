export type SeasonStatus = "upcoming" | "active" | "completed" | "archived";

export type Season = {
  id: string;
  teamId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
  description?: string;
  objectives?: string;
  competitionCategory?: string;
  budget?: number;
  colorPrimary?: string;
  colorSecondary?: string;
  createdAt: string;
};

/**
 * All pre-season mock data (players, matches, training) predates the Season
 * feature, so it's backfilled onto this one season rather than left orphaned.
 */
export const DEFAULT_SEASON_ID = "season_2026";

export const seasons: Season[] = [
  {
    id: DEFAULT_SEASON_ID,
    teamId: "team_001",
    name: "2026 Season",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active",
    competitionCategory: "Ellembelle District League",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export function getSeasonById(seasons: Season[], id: string): Season | undefined {
  return seasons.find((season) => season.id === id);
}

export function getActiveSeason(seasons: Season[]): Season | undefined {
  return seasons.find((season) => season.status === "active");
}

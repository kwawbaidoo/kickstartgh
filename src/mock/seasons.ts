export type SeasonStatus = "upcoming" | "active" | "completed" | "archived";

export type Season = {
  id: string;
  team_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: SeasonStatus;
  description?: string;
  objectives?: string;
  competition_category?: string;
  budget?: number;
  color_primary?: string;
  color_secondary?: string;
  created_at: string;
};

/**
 * All pre-season mock data (players, matches, training) predates the Season
 * feature, so it's backfilled onto this one season rather than left orphaned.
 */
export const DEFAULT_SEASON_ID = "season_2026";

export const seasons: Season[] = [
  {
    id: DEFAULT_SEASON_ID,
    team_id: "team_001",
    name: "2026 Season",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "active",
    competition_category: "Ellembelle District League",
    created_at: "2026-01-01T00:00:00Z",
  },
];

export function getSeasonById(seasons: Season[], id: string): Season | undefined {
  return seasons.find((season) => season.id === id);
}

export function getActiveSeason(seasons: Season[]): Season | undefined {
  return seasons.find((season) => season.status === "active");
}

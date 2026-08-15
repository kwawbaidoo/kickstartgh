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
 * Stamp value used by players/matches/sessions created before a real season exists,
 * so their season_id has somewhere to point rather than being left orphaned. Not a
 * lookup key — nothing assumes a Season with this id actually exists in `seasons`.
 */
export const DEFAULT_SEASON_ID = "season_2026";

export const seasons: Season[] = [];

export function getSeasonById(seasons: Season[], id: string): Season | undefined {
  return seasons.find((season) => season.id === id);
}

export function getActiveSeason(seasons: Season[]): Season | undefined {
  return seasons.find((season) => season.status === "active");
}

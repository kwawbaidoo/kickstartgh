export type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export type PreferredFoot = "Left" | "Right" | "Both";

export type PlayerStatus = "Active" | "Injured" | "Inactive" | "Suspended";

export type StatusChange = {
  status: PlayerStatus;
  date: string;
};

/**
 * A player's registration for one season — jersey number and status can
 * differ season to season (e.g. #11 in 2025, #9 in 2026), while the player
 * themselves stays one continuous identity across every season they've played.
 */
export type PlayerSeasonRecord = {
  season_id: string;
  jersey_number: number;
  status: PlayerStatus;
  registered_at: string;
};

export type Player = {
  id: string;
  team_id: string;
  full_name: string;
  nickname?: string;
  photo?: string;
  position: Position;
  secondary_position?: Position;
  jersey_number: number;
  preferred_foot: PreferredFoot;
  date_of_birth: string;
  phone?: string;
  /** Free-text field — the real backend stores this as a plain string, not a structured contact. */
  emergency_contact?: string;
  village?: string;
  previous_club?: string;
  status: PlayerStatus;
  status_history: StatusChange[];
  created_at: string;
  /**
   * Every player must be registered for at least one season (never empty).
   * The top-level `jersey_number`/`status` above always mirror this player's
   * record in the currently active season — see registerPlayerForSeason /
   * getSeasonRecord in lib/players.ts for how the two stay in sync.
   */
  season_records: PlayerSeasonRecord[];
};

export const players: Player[] = [];

export function getPlayersByTeam(team_id: string): Player[] {
  return players.filter((player) => player.team_id === team_id);
}

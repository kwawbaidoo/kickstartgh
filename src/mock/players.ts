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

export type EmergencyContact = {
  name?: string;
  phone?: string;
  email?: string;
};

export type EducationEntry = {
  institution: string;
  period: string;
};

export type SocialLinks = {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
};

/**
 * A player's public marketability profile — the details a scout, other club,
 * or tournament organizer would want when the profile is shared outside the
 * team (see the public profile page at /players/[id]/profile). All optional,
 * since most teams will only fill this in for players they're promoting.
 */
export type MarketabilityProfile = {
  nationality?: string;
  height?: string;
  education?: EducationEntry[];
  work_experience?: string[];
  achievements?: string[];
  other_sports?: string[];
  social_links?: SocialLinks;
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
  email?: string;
  emergency_contact?: EmergencyContact;
  village?: string;
  previous_club?: string;
  status: PlayerStatus;
  status_history: StatusChange[];
  created_at: string;
  profile?: MarketabilityProfile;
  /**
   * Every player must be registered for at least one season (never empty).
   * The top-level `jersey_number`/`status` above always mirror this player's
   * record in the currently active season — see registerPlayerForSeason /
   * getSeasonRecord in lib/players.ts for how the two stay in sync.
   */
  season_records: PlayerSeasonRecord[];
  /**
   * Match-derived numbers (matchesPlayed/goals/assists/cards) are computed
   * live from matchesStore via getPlayerMatchStats — see lib/matches.ts.
   * Attendance is computed live too, from attendanceStore + matchesStore —
   * see getPlayerAttendanceStats in lib/attendance.ts. Only rating is stored
   * here, since it isn't sourced from any event/session data.
   */
  stats: {
    rating: number;
  };
};

export const players: Player[] = [];

export function getPlayersByTeam(team_id: string): Player[] {
  return players.filter((player) => player.team_id === team_id);
}

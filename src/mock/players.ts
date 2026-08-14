import { DEFAULT_SEASON_ID } from "@/mock/seasons";

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

const seedPlayers: Omit<Player, "season_records">[] = [
  {
    id: "player_001",
    team_id: "team_001",
    full_name: "Kwesi Mensah",
    nickname: "KM9",
    position: "Forward",
    jersey_number: 9,
    preferred_foot: "Right",
    date_of_birth: "2005-05-12",
    phone: "+233241234567",
    village: "Ellembelle",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    created_at: "2024-02-10T09:00:00Z",
    stats: { rating: 8.1 },
    profile: {
      nationality: "Ghanaian",
      height: "5ft 10in",
      education: [
        { institution: "Ellembelle Senior High School", period: "2019-2022" },
        { institution: "Takoradi Technical University", period: "2023-Present" },
      ],
      work_experience: ["Coaching assistant, Ellembelle Youth Academy"],
      achievements: [
        "Ellembelle District League top scorer (2025)",
        "Regional Cup quarter-final winner (2026)",
        "Man of the Match — vs Unity FC (May 2026)",
      ],
      other_sports: ["Athletics", "Volleyball"],
      social_links: { instagram: "https://instagram.com/km9official" },
    },
  },
  {
    id: "player_002",
    team_id: "team_001",
    full_name: "Yaw Darko",
    position: "Midfielder",
    secondary_position: "Defender",
    jersey_number: 8,
    preferred_foot: "Right",
    date_of_birth: "2004-11-02",
    phone: "+233209876543",
    village: "Nkroful",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    created_at: "2024-02-10T09:00:00Z",
    stats: { rating: 7.6 },
  },
  {
    id: "player_003",
    team_id: "team_001",
    full_name: "Kofi Owusu",
    position: "Defender",
    jersey_number: 4,
    preferred_foot: "Left",
    date_of_birth: "2003-02-20",
    phone: "+233551122334",
    previous_club: "Axim Stars Youth",
    status: "Injured",
    status_history: [
      { status: "Active", date: "2024-03-05T09:00:00Z" },
      { status: "Injured", date: "2025-01-15T09:00:00Z" },
    ],
    created_at: "2024-03-05T09:00:00Z",
    stats: { rating: 7.4 },
  },
  {
    id: "player_004",
    team_id: "team_001",
    full_name: "Abdul Rahman Iddrisu",
    nickname: "Rahman",
    position: "Goalkeeper",
    jersey_number: 1,
    preferred_foot: "Right",
    date_of_birth: "2002-08-15",
    phone: "+233267788990",
    email: "abdul.iddrisu@example.com",
    emergency_contact: { name: "Comfort Iddrisu", phone: "+233267700000" },
    status: "Active",
    status_history: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    created_at: "2024-01-20T09:00:00Z",
    stats: { rating: 7.9 },
  },
  {
    id: "player_005",
    team_id: "team_001",
    full_name: "Emmanuel Asante",
    position: "Midfielder",
    jersey_number: 6,
    preferred_foot: "Right",
    date_of_birth: "2005-01-30",
    phone: "+233246655443",
    village: "Bonsaso",
    status: "Active",
    status_history: [{ status: "Active", date: "2025-06-14T09:00:00Z" }],
    created_at: "2025-06-14T09:00:00Z",
    stats: { rating: 7.5 },
  },
  {
    id: "player_006",
    team_id: "team_001",
    full_name: "Fiifi Arthur",
    position: "Defender",
    secondary_position: "Midfielder",
    jersey_number: 5,
    preferred_foot: "Right",
    date_of_birth: "2004-06-18",
    phone: "+233201239876",
    status: "Inactive",
    status_history: [
      { status: "Active", date: "2024-05-01T09:00:00Z" },
      { status: "Inactive", date: "2025-04-01T09:00:00Z" },
    ],
    created_at: "2024-05-01T09:00:00Z",
    stats: { rating: 7.0 },
  },
  {
    id: "player_007",
    team_id: "team_001",
    full_name: "Nana Kwame Boadi",
    nickname: "Showboy",
    position: "Forward",
    jersey_number: 11,
    preferred_foot: "Left",
    date_of_birth: "2006-03-09",
    phone: "+233544321098",
    previous_club: "Half Assini United",
    status: "Active",
    status_history: [{ status: "Active", date: "2025-07-01T09:00:00Z" }],
    created_at: "2025-07-01T09:00:00Z",
    stats: { rating: 7.7 },
  },
  {
    id: "player_008",
    team_id: "team_001",
    full_name: "Samuel Tetteh",
    position: "Goalkeeper",
    jersey_number: 12,
    preferred_foot: "Right",
    date_of_birth: "2005-09-22",
    phone: "+233245566778",
    village: "Nkroful",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-08-12T09:00:00Z" }],
    created_at: "2024-08-12T09:00:00Z",
    stats: { rating: 7.2 },
  },
  {
    id: "player_009",
    team_id: "team_001",
    full_name: "Isaac Amoah",
    position: "Defender",
    jersey_number: 2,
    preferred_foot: "Right",
    date_of_birth: "2003-11-11",
    phone: "+233248811223",
    village: "Ellembelle",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    created_at: "2024-01-20T09:00:00Z",
    stats: { rating: 7.3 },
  },
  {
    id: "player_010",
    team_id: "team_001",
    full_name: "Prince Yeboah",
    position: "Defender",
    jersey_number: 3,
    preferred_foot: "Left",
    date_of_birth: "2004-04-04",
    phone: "+233209988776",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    created_at: "2024-01-20T09:00:00Z",
    stats: { rating: 7.2 },
  },
  {
    id: "player_011",
    team_id: "team_001",
    full_name: "Ibrahim Mahama",
    position: "Defender",
    jersey_number: 15,
    preferred_foot: "Right",
    date_of_birth: "2003-07-19",
    phone: "+233267112233",
    village: "Nkroful",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    created_at: "2024-01-20T09:00:00Z",
    stats: { rating: 7.1 },
  },
  {
    id: "player_012",
    team_id: "team_001",
    full_name: "Yaw Sarpong",
    position: "Defender",
    jersey_number: 14,
    preferred_foot: "Right",
    date_of_birth: "2005-02-27",
    phone: "+233541122998",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-03-05T09:00:00Z" }],
    created_at: "2024-03-05T09:00:00Z",
    stats: { rating: 7.0 },
  },
  {
    id: "player_013",
    team_id: "team_001",
    full_name: "Yaw Boateng",
    position: "Midfielder",
    jersey_number: 10,
    preferred_foot: "Left",
    date_of_birth: "2004-09-08",
    phone: "+233248877665",
    village: "Bonsaso",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    created_at: "2024-02-10T09:00:00Z",
    stats: { rating: 7.8 },
  },
  {
    id: "player_014",
    team_id: "team_001",
    full_name: "Daniel Owusu",
    position: "Midfielder",
    jersey_number: 7,
    preferred_foot: "Right",
    date_of_birth: "2005-12-01",
    phone: "+233201122556",
    status: "Active",
    status_history: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    created_at: "2024-02-10T09:00:00Z",
    stats: { rating: 7.3 },
  },
  {
    id: "player_015",
    team_id: "team_001",
    full_name: "Kojo Antwi",
    position: "Forward",
    jersey_number: 17,
    preferred_foot: "Right",
    date_of_birth: "2006-06-30",
    phone: "+233549900112",
    village: "Ellembelle",
    status: "Active",
    status_history: [{ status: "Active", date: "2025-06-14T09:00:00Z" }],
    created_at: "2025-06-14T09:00:00Z",
    stats: { rating: 7.2 },
  },
  {
    id: "player_016",
    team_id: "team_001",
    full_name: "Solomon Frimpong",
    position: "Forward",
    jersey_number: 19,
    preferred_foot: "Both",
    date_of_birth: "2005-10-05",
    phone: "+233267334455",
    status: "Active",
    status_history: [{ status: "Active", date: "2025-07-01T09:00:00Z" }],
    created_at: "2025-07-01T09:00:00Z",
    stats: { rating: 6.9 },
  },
];

export const players: Player[] = seedPlayers.map((player) => ({
  ...player,
  season_records: [
    {
      season_id: DEFAULT_SEASON_ID,
      jersey_number: player.jersey_number,
      status: player.status,
      registered_at: player.created_at,
    },
  ],
}));

export function getPlayersByTeam(team_id: string): Player[] {
  return players.filter((player) => player.team_id === team_id);
}

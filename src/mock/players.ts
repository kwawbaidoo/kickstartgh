export type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export type PreferredFoot = "Left" | "Right" | "Both";

export type PlayerStatus = "Active" | "Injured" | "Inactive" | "Suspended";

export type StatusChange = {
  status: PlayerStatus;
  date: string;
};

export type EmergencyContact = {
  name?: string;
  phone?: string;
  email?: string;
};

export type Player = {
  id: string;
  teamId: string;
  fullName: string;
  nickname?: string;
  photo?: string;
  position: Position;
  secondaryPosition?: Position;
  jerseyNumber: number;
  preferredFoot: PreferredFoot;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  emergencyContact?: EmergencyContact;
  village?: string;
  previousClub?: string;
  status: PlayerStatus;
  statusHistory: StatusChange[];
  createdAt: string;
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

export const players: Player[] = [
  {
    id: "player_001",
    teamId: "team_001",
    fullName: "Kwesi Mensah",
    nickname: "KM9",
    position: "Forward",
    jerseyNumber: 9,
    preferredFoot: "Right",
    dateOfBirth: "2005-05-12",
    phone: "+233241234567",
    village: "Ellembelle",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    createdAt: "2024-02-10T09:00:00Z",
    stats: { rating: 8.1 },
  },
  {
    id: "player_002",
    teamId: "team_001",
    fullName: "Yaw Darko",
    position: "Midfielder",
    secondaryPosition: "Defender",
    jerseyNumber: 8,
    preferredFoot: "Right",
    dateOfBirth: "2004-11-02",
    phone: "+233209876543",
    village: "Nkroful",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    createdAt: "2024-02-10T09:00:00Z",
    stats: { rating: 7.6 },
  },
  {
    id: "player_003",
    teamId: "team_001",
    fullName: "Kofi Owusu",
    position: "Defender",
    jerseyNumber: 4,
    preferredFoot: "Left",
    dateOfBirth: "2003-02-20",
    phone: "+233551122334",
    previousClub: "Axim Stars Youth",
    status: "Injured",
    statusHistory: [
      { status: "Active", date: "2024-03-05T09:00:00Z" },
      { status: "Injured", date: "2025-01-15T09:00:00Z" },
    ],
    createdAt: "2024-03-05T09:00:00Z",
    stats: { rating: 7.4 },
  },
  {
    id: "player_004",
    teamId: "team_001",
    fullName: "Abdul Rahman Iddrisu",
    nickname: "Rahman",
    position: "Goalkeeper",
    jerseyNumber: 1,
    preferredFoot: "Right",
    dateOfBirth: "2002-08-15",
    phone: "+233267788990",
    email: "abdul.iddrisu@example.com",
    emergencyContact: { name: "Comfort Iddrisu", phone: "+233267700000" },
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    createdAt: "2024-01-20T09:00:00Z",
    stats: { rating: 7.9 },
  },
  {
    id: "player_005",
    teamId: "team_001",
    fullName: "Emmanuel Asante",
    position: "Midfielder",
    jerseyNumber: 6,
    preferredFoot: "Right",
    dateOfBirth: "2005-01-30",
    phone: "+233246655443",
    village: "Bonsaso",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2025-06-14T09:00:00Z" }],
    createdAt: "2025-06-14T09:00:00Z",
    stats: { rating: 7.5 },
  },
  {
    id: "player_006",
    teamId: "team_001",
    fullName: "Fiifi Arthur",
    position: "Defender",
    secondaryPosition: "Midfielder",
    jerseyNumber: 5,
    preferredFoot: "Right",
    dateOfBirth: "2004-06-18",
    phone: "+233201239876",
    status: "Inactive",
    statusHistory: [
      { status: "Active", date: "2024-05-01T09:00:00Z" },
      { status: "Inactive", date: "2025-04-01T09:00:00Z" },
    ],
    createdAt: "2024-05-01T09:00:00Z",
    stats: { rating: 7.0 },
  },
  {
    id: "player_007",
    teamId: "team_001",
    fullName: "Nana Kwame Boadi",
    nickname: "Showboy",
    position: "Forward",
    jerseyNumber: 11,
    preferredFoot: "Left",
    dateOfBirth: "2006-03-09",
    phone: "+233544321098",
    previousClub: "Half Assini United",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2025-07-01T09:00:00Z" }],
    createdAt: "2025-07-01T09:00:00Z",
    stats: { rating: 7.7 },
  },
  {
    id: "player_008",
    teamId: "team_001",
    fullName: "Samuel Tetteh",
    position: "Goalkeeper",
    jerseyNumber: 12,
    preferredFoot: "Right",
    dateOfBirth: "2005-09-22",
    phone: "+233245566778",
    village: "Nkroful",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-08-12T09:00:00Z" }],
    createdAt: "2024-08-12T09:00:00Z",
    stats: { rating: 7.2 },
  },
  {
    id: "player_009",
    teamId: "team_001",
    fullName: "Isaac Amoah",
    position: "Defender",
    jerseyNumber: 2,
    preferredFoot: "Right",
    dateOfBirth: "2003-11-11",
    phone: "+233248811223",
    village: "Ellembelle",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    createdAt: "2024-01-20T09:00:00Z",
    stats: { rating: 7.3 },
  },
  {
    id: "player_010",
    teamId: "team_001",
    fullName: "Prince Yeboah",
    position: "Defender",
    jerseyNumber: 3,
    preferredFoot: "Left",
    dateOfBirth: "2004-04-04",
    phone: "+233209988776",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    createdAt: "2024-01-20T09:00:00Z",
    stats: { rating: 7.2 },
  },
  {
    id: "player_011",
    teamId: "team_001",
    fullName: "Ibrahim Mahama",
    position: "Defender",
    jerseyNumber: 15,
    preferredFoot: "Right",
    dateOfBirth: "2003-07-19",
    phone: "+233267112233",
    village: "Nkroful",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-01-20T09:00:00Z" }],
    createdAt: "2024-01-20T09:00:00Z",
    stats: { rating: 7.1 },
  },
  {
    id: "player_012",
    teamId: "team_001",
    fullName: "Yaw Sarpong",
    position: "Defender",
    jerseyNumber: 14,
    preferredFoot: "Right",
    dateOfBirth: "2005-02-27",
    phone: "+233541122998",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-03-05T09:00:00Z" }],
    createdAt: "2024-03-05T09:00:00Z",
    stats: { rating: 7.0 },
  },
  {
    id: "player_013",
    teamId: "team_001",
    fullName: "Yaw Boateng",
    position: "Midfielder",
    jerseyNumber: 10,
    preferredFoot: "Left",
    dateOfBirth: "2004-09-08",
    phone: "+233248877665",
    village: "Bonsaso",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    createdAt: "2024-02-10T09:00:00Z",
    stats: { rating: 7.8 },
  },
  {
    id: "player_014",
    teamId: "team_001",
    fullName: "Daniel Owusu",
    position: "Midfielder",
    jerseyNumber: 7,
    preferredFoot: "Right",
    dateOfBirth: "2005-12-01",
    phone: "+233201122556",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2024-02-10T09:00:00Z" }],
    createdAt: "2024-02-10T09:00:00Z",
    stats: { rating: 7.3 },
  },
  {
    id: "player_015",
    teamId: "team_001",
    fullName: "Kojo Antwi",
    position: "Forward",
    jerseyNumber: 17,
    preferredFoot: "Right",
    dateOfBirth: "2006-06-30",
    phone: "+233549900112",
    village: "Ellembelle",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2025-06-14T09:00:00Z" }],
    createdAt: "2025-06-14T09:00:00Z",
    stats: { rating: 7.2 },
  },
  {
    id: "player_016",
    teamId: "team_001",
    fullName: "Solomon Frimpong",
    position: "Forward",
    jerseyNumber: 19,
    preferredFoot: "Both",
    dateOfBirth: "2005-10-05",
    phone: "+233267334455",
    status: "Active",
    statusHistory: [{ status: "Active", date: "2025-07-01T09:00:00Z" }],
    createdAt: "2025-07-01T09:00:00Z",
    stats: { rating: 6.9 },
  },
];

export function getPlayersByTeam(teamId: string): Player[] {
  return players.filter((player) => player.teamId === teamId);
}

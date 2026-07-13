export type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export type Player = {
  id: string;
  teamId: string;
  fullName: string;
  position: Position;
  jerseyNumber: number;
  preferredFoot: "Left" | "Right" | "Both";
  dateOfBirth: string;
  phone: string;
  stats: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    attendancePercentage: number;
    yellowCards: number;
    redCards: number;
    rating: number;
  };
};

export const players: Player[] = [
  {
    id: "player_001",
    teamId: "team_001",
    fullName: "Kwesi Mensah",
    position: "Forward",
    jerseyNumber: 9,
    preferredFoot: "Right",
    dateOfBirth: "2005-05-12",
    phone: "+233241234567",
    stats: { matchesPlayed: 15, goals: 8, assists: 3, attendancePercentage: 92, yellowCards: 1, redCards: 0, rating: 8.1 },
  },
  {
    id: "player_002",
    teamId: "team_001",
    fullName: "Yaw Darko",
    position: "Midfielder",
    jerseyNumber: 8,
    preferredFoot: "Right",
    dateOfBirth: "2004-11-02",
    phone: "+233209876543",
    stats: { matchesPlayed: 14, goals: 2, assists: 6, attendancePercentage: 88, yellowCards: 2, redCards: 0, rating: 7.6 },
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
    stats: { matchesPlayed: 16, goals: 1, assists: 0, attendancePercentage: 95, yellowCards: 3, redCards: 0, rating: 7.4 },
  },
  {
    id: "player_004",
    teamId: "team_001",
    fullName: "Abdul Rahman Iddrisu",
    position: "Goalkeeper",
    jerseyNumber: 1,
    preferredFoot: "Right",
    dateOfBirth: "2002-08-15",
    phone: "+233267788990",
    stats: { matchesPlayed: 16, goals: 0, assists: 0, attendancePercentage: 97, yellowCards: 0, redCards: 0, rating: 7.9 },
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
    stats: { matchesPlayed: 13, goals: 3, assists: 4, attendancePercentage: 85, yellowCards: 1, redCards: 0, rating: 7.5 },
  },
  {
    id: "player_006",
    teamId: "team_001",
    fullName: "Fiifi Arthur",
    position: "Defender",
    jerseyNumber: 5,
    preferredFoot: "Right",
    dateOfBirth: "2004-06-18",
    phone: "+233201239876",
    stats: { matchesPlayed: 15, goals: 0, assists: 1, attendancePercentage: 90, yellowCards: 2, redCards: 1, rating: 7.0 },
  },
  {
    id: "player_007",
    teamId: "team_001",
    fullName: "Nana Kwame Boadi",
    position: "Forward",
    jerseyNumber: 11,
    preferredFoot: "Left",
    dateOfBirth: "2006-03-09",
    phone: "+233544321098",
    stats: { matchesPlayed: 12, goals: 5, assists: 2, attendancePercentage: 80, yellowCards: 0, redCards: 0, rating: 7.7 },
  },
];

export function getPlayersByTeam(teamId: string): Player[] {
  return players.filter((player) => player.teamId === teamId);
}

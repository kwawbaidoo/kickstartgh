export type ReportType = "player" | "team" | "match" | "attendance";

export type ReportColumn = { key: string; label: string };

export type ExportFormat = "PDF" | "Excel" | "CSV" | "Print";

export const reportTypeLabels: Record<ReportType, string> = {
  player: "Player Report",
  team: "Team Report",
  match: "Match Report",
  attendance: "Attendance Report",
};

export const playerReportColumns: ReportColumn[] = [
  { key: "fullName", label: "Name" },
  { key: "nickname", label: "Nickname" },
  { key: "dateOfBirth", label: "Date of Birth" },
  { key: "position", label: "Position" },
  { key: "jerseyNumber", label: "Jersey #" },
  { key: "preferredFoot", label: "Preferred Foot" },
  { key: "phone", label: "Phone" },
  { key: "matchesPlayed", label: "Matches" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "yellowCards", label: "Yellow Cards" },
  { key: "redCards", label: "Red Cards" },
  { key: "attendance", label: "Attendance %" },
];

export const playerReportDefaultColumns = [
  "fullName",
  "position",
  "jerseyNumber",
  "matchesPlayed",
  "goals",
  "assists",
];

export const playerReportPresets: { name: string; columns: string[] }[] = [
  {
    name: "Basic Squad List",
    columns: ["fullName", "position", "jerseyNumber", "preferredFoot"],
  },
  {
    name: "Scouting Report",
    columns: ["fullName", "dateOfBirth", "position", "preferredFoot", "goals", "assists", "attendance"],
  },
  {
    name: "Match Statistics",
    columns: ["fullName", "matchesPlayed", "goals", "assists", "yellowCards", "redCards"],
  },
  {
    name: "Full Team Report",
    columns: playerReportColumns.map((column) => column.key),
  },
];

export const teamReportColumns: ReportColumn[] = [
  { key: "name", label: "Team Name" },
  { key: "region", label: "Region" },
  { key: "homeGround", label: "Home Ground" },
  { key: "headCoach", label: "Head Coach" },
  { key: "assistantCoach", label: "Assistant Coach" },
  { key: "captain", label: "Captain" },
  { key: "playerCount", label: "Players" },
  { key: "matchesPlayed", label: "Matches Played" },
  { key: "wins", label: "Wins" },
  { key: "draws", label: "Draws" },
  { key: "losses", label: "Losses" },
  { key: "goalsFor", label: "Goals Scored" },
  { key: "goalsAgainst", label: "Goals Conceded" },
  { key: "winPercentage", label: "Win %" },
];

export const teamReportDefaultColumns = teamReportColumns.map((column) => column.key);

export const matchReportColumns: ReportColumn[] = [
  { key: "opponent", label: "Opponent" },
  { key: "competition", label: "Competition" },
  { key: "date", label: "Date" },
  { key: "venue", label: "Venue" },
  { key: "scoreline", label: "Scoreline" },
  { key: "scorers", label: "Scorers" },
  { key: "assists", label: "Assists" },
  { key: "cards", label: "Cards" },
  { key: "substitutions", label: "Substitutions" },
  { key: "notes", label: "Notes" },
];

export const matchReportDefaultColumns = [
  "opponent",
  "competition",
  "date",
  "venue",
  "scoreline",
  "scorers",
];

export const attendanceReportColumns: ReportColumn[] = [
  { key: "rank", label: "Rank" },
  { key: "fullName", label: "Name" },
  { key: "attendancePercentage", label: "Attendance %" },
  { key: "presentCount", label: "Present" },
  { key: "absentCount", label: "Missed" },
  { key: "lateCount", label: "Late" },
];

export const attendanceReportDefaultColumns = attendanceReportColumns.map((column) => column.key);

export const reportColumnsByType: Record<ReportType, ReportColumn[]> = {
  player: playerReportColumns,
  team: teamReportColumns,
  match: matchReportColumns,
  attendance: attendanceReportColumns,
};

export const reportDefaultColumnsByType: Record<ReportType, string[]> = {
  player: playerReportDefaultColumns,
  team: teamReportDefaultColumns,
  match: matchReportDefaultColumns,
  attendance: attendanceReportDefaultColumns,
};

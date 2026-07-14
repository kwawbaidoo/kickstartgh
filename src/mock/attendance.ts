import { players } from "@/mock/players";

export type AttendanceStatus = "present" | "late" | "excused" | "injured" | "absent";

export type TrainingFocus =
  | "Fitness"
  | "Tactical"
  | "Shooting"
  | "Defending"
  | "Goalkeeping"
  | "Recovery"
  | "Friendly Match"
  | "General Training";

export type SessionStatus = "upcoming" | "completed" | "cancelled";

export type AttendanceSession = {
  id: string;
  teamId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  description?: string;
  focus?: TrainingFocus;
  equipment?: string[];
  notes?: string;
  status: SessionStatus;
  records: Record<string, AttendanceStatus>;
  createdAt: string;
};

const sessionDates = [
  "2026-04-14",
  "2026-04-21",
  "2026-04-28",
  "2026-05-05",
  "2026-05-12",
  "2026-05-19",
  "2026-05-26",
  "2026-06-02",
  "2026-06-09",
  "2026-06-16",
  "2026-06-23",
  "2026-06-30",
  "2026-07-07",
];

/**
 * FNV-1a + a murmur-style finalizer, since a plain multiplicative hash doesn't
 * avalanche enough to spread out structurally-similar seeds like "player_001"
 * vs "player_002" — it clustered nearly everyone into the same bucket instead
 * of producing realistic variation.
 */
function seededRandom(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

function pickStatus(seed: string): AttendanceStatus {
  const roll = seededRandom(seed);
  if (roll < 0.76) return "present";
  if (roll < 0.86) return "absent";
  if (roll < 0.94) return "late";
  if (roll < 0.98) return "excused";
  return "injured";
}

const activePlayers = players.filter((player) => player.status === "Active");

export const attendanceSessions: AttendanceSession[] = sessionDates.map((date, index) => ({
  id: `session_${String(index + 1).padStart(3, "0")}`,
  teamId: "team_001",
  title: "Tuesday Training",
  date,
  startTime: "16:00",
  endTime: "17:30",
  venue: "Community Park",
  focus: "General Training",
  status: "completed",
  records: Object.fromEntries(
    activePlayers.map((player) => [player.id, pickStatus(`${player.id}-${index}`)])
  ),
  createdAt: `${date}T08:00:00Z`,
}));

// A session for today (so the dashboard's "Today's Session" has real data)
// plus one further out, without needing to schedule one first.
attendanceSessions.push(
  {
    id: "session_014",
    teamId: "team_001",
    title: "Sharpening Session",
    date: "2026-07-13",
    startTime: "16:00",
    endTime: "17:30",
    venue: "Community Park",
    description: "Light session to keep sharp before the weekend cup tie.",
    focus: "Tactical",
    equipment: ["Cones", "Bibs", "Match balls"],
    status: "upcoming",
    records: {},
    createdAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "session_015",
    teamId: "team_001",
    title: "Pre-Cup Sharpening Session",
    date: "2026-07-19",
    startTime: "16:00",
    endTime: "17:30",
    venue: "Community Park",
    description: "Final session before the Regional Cup fixture vs Sekondi Warriors.",
    focus: "Tactical",
    equipment: ["Cones", "Bibs", "Match balls"],
    status: "upcoming",
    records: {},
    createdAt: "2026-07-13T08:00:00Z",
  }
);

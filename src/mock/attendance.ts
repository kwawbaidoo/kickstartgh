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
  team_id: string;
  season_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  description?: string;
  focus?: TrainingFocus;
  equipment?: string[];
  notes?: string;
  status: SessionStatus;
  records: Record<string, AttendanceStatus>;
  created_at: string;
};

export const attendanceSessions: AttendanceSession[] = [];

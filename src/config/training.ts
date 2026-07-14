import {
  CircleCheck,
  CircleX,
  Clock,
  Dumbbell,
  FileText,
  Goal,
  Hand,
  HeartPulse,
  Shield,
  Swords,
  Target,
  type LucideIcon,
} from "lucide-react";

import type { AttendanceStatus, SessionStatus, TrainingFocus } from "@/mock/attendance";

export const trainingFocusOptions: TrainingFocus[] = [
  "Fitness",
  "Tactical",
  "Shooting",
  "Defending",
  "Goalkeeping",
  "Recovery",
  "Friendly Match",
  "General Training",
];

export const trainingFocusIcon: Record<TrainingFocus, LucideIcon> = {
  Fitness: Dumbbell,
  Tactical: Target,
  Shooting: Goal,
  Defending: Shield,
  Goalkeeping: Hand,
  Recovery: HeartPulse,
  "Friendly Match": Swords,
  "General Training": FileText,
};

export const sessionStatusOptions: SessionStatus[] = ["upcoming", "completed", "cancelled"];

export const attendanceStatusOptions: AttendanceStatus[] = [
  "present",
  "late",
  "excused",
  "injured",
  "absent",
];

type AttendanceStatusConfig = {
  label: string;
  icon: LucideIcon;
  colorClass: string;
};

export const attendanceStatusConfig: Record<AttendanceStatus, AttendanceStatusConfig> = {
  present: {
    label: "Present",
    icon: CircleCheck,
    colorClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  late: {
    label: "Late",
    icon: Clock,
    colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  excused: {
    label: "Excused",
    icon: FileText,
    colorClass: "bg-muted text-muted-foreground",
  },
  injured: {
    label: "Injured",
    icon: HeartPulse,
    colorClass: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  },
  absent: {
    label: "Absent",
    icon: CircleX,
    colorClass: "bg-destructive/10 text-destructive",
  },
};

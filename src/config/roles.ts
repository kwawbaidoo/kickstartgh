import { Award, Briefcase, Megaphone, UserCog, type LucideIcon } from "lucide-react";

export const roleIds = ["teamManager", "headCoach", "assistantCoach", "captain"] as const;

export type RoleId = (typeof roleIds)[number];

export type RoleOption = {
  id: RoleId;
  label: string;
  description: string;
  icon: LucideIcon;
  recommended?: boolean;
};

export const roleOptions: RoleOption[] = [
  {
    id: "teamManager",
    label: "Team Manager",
    description: "Runs the team day-to-day: players, staff, and reports.",
    icon: Briefcase,
    recommended: true,
  },
  {
    id: "headCoach",
    label: "Head Coach",
    description: "Picks the squad and records match results.",
    icon: Megaphone,
  },
  {
    id: "assistantCoach",
    label: "Assistant Coach",
    description: "Supports training and match-day duties.",
    icon: UserCog,
  },
  {
    id: "captain",
    label: "Team Captain",
    description: "Leads the squad on and off the pitch.",
    icon: Award,
  },
];

export const staffRoleOptions: { value: RoleId; label: string }[] = [
  { value: "headCoach", label: "Head Coach" },
  { value: "assistantCoach", label: "Assistant Coach" },
  { value: "teamManager", label: "Team Manager" },
  { value: "captain", label: "Captain" },
];

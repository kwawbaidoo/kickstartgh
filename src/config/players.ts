import type { PlayerStatus, Position, PreferredFoot } from "@/mock/players";

export const positionOptions: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export const preferredFootOptions: PreferredFoot[] = ["Left", "Right", "Both"];

export const statusOptions: PlayerStatus[] = ["Active", "Injured", "Inactive", "Suspended"];

export type AgeGroup = "Under 18" | "18-24" | "25-30" | "31+";

export const ageGroupOptions: AgeGroup[] = ["Under 18", "18-24", "25-30", "31+"];

export const statusBadgeClasses: Record<PlayerStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Injured: "bg-destructive/10 text-destructive",
  Inactive: "bg-muted text-muted-foreground",
  Suspended: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

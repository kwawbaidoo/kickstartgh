import type { SeasonStatus } from "@/mock/seasons";

export const seasonStatusOptions: SeasonStatus[] = ["upcoming", "active", "completed", "archived"];

export const seasonStatusLabels: Record<SeasonStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const seasonStatusBadgeClasses: Record<SeasonStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  upcoming: "bg-accent/20 text-accent-foreground dark:bg-accent/15 dark:text-accent",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground/70",
};

export const seasonStatusDotClasses: Record<SeasonStatus, string> = {
  active: "bg-emerald-500",
  upcoming: "bg-accent",
  completed: "bg-muted-foreground",
  archived: "bg-muted-foreground/50",
};

export const competitionCategoryOptions = [
  "League",
  "Cup",
  "Friendly",
  "Youth League",
  "Community League",
] as const;

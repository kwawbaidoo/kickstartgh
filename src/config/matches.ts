import { ArrowLeftRight, Goal, Square, Stethoscope, type LucideIcon } from "lucide-react";

import type { Formation, MatchEventType, MatchStatus, MatchType } from "@/mock/matches";

export const matchTypeOptions: MatchType[] = [
  "Friendly",
  "League",
  "Tournament",
  "Knockout",
];

export const matchStatusOptions: MatchStatus[] = ["upcoming", "completed", "cancelled"];

export const formationOptions: Formation[] = ["4-4-2", "4-3-3", "3-5-2", "5-3-2"];

type FormationRow = { row: "FWD" | "MID" | "DEF" | "GK"; count: number };

export const formationRows: Record<Formation, FormationRow[]> = {
  "4-4-2": [
    { row: "FWD", count: 2 },
    { row: "MID", count: 4 },
    { row: "DEF", count: 4 },
    { row: "GK", count: 1 },
  ],
  "4-3-3": [
    { row: "FWD", count: 3 },
    { row: "MID", count: 3 },
    { row: "DEF", count: 4 },
    { row: "GK", count: 1 },
  ],
  "3-5-2": [
    { row: "FWD", count: 2 },
    { row: "MID", count: 5 },
    { row: "DEF", count: 3 },
    { row: "GK", count: 1 },
  ],
  "5-3-2": [
    { row: "FWD", count: 2 },
    { row: "MID", count: 3 },
    { row: "DEF", count: 5 },
    { row: "GK", count: 1 },
  ],
};

export const rowYPosition: Record<FormationRow["row"], number> = {
  FWD: 12,
  MID: 40,
  DEF: 68,
  GK: 90,
};

type EventTypeConfig = {
  label: string;
  emoji: string;
  icon: LucideIcon;
  colorClass: string;
};

export const eventTypeConfig: Record<MatchEventType, EventTypeConfig> = {
  goal: { label: "Goal", emoji: "⚽", icon: Goal, colorClass: "bg-accent text-accent-foreground" },
  yellow_card: {
    label: "Yellow Card",
    emoji: "🟨",
    icon: Square,
    colorClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  },
  red_card: {
    label: "Red Card",
    emoji: "🟥",
    icon: Square,
    colorClass: "bg-destructive/10 text-destructive",
  },
  substitution: {
    label: "Substitution",
    emoji: "🔄",
    icon: ArrowLeftRight,
    colorClass: "bg-muted text-muted-foreground",
  },
  injury: {
    label: "Injury",
    emoji: "🩹",
    icon: Stethoscope,
    colorClass: "bg-muted text-muted-foreground",
  },
};

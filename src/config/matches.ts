import {
  ArrowLeftRight,
  Goal,
  Square,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import type {
  Formation,
  MatchEventType,
  MatchStatus,
  MatchType,
} from "@/mock/matches";

export const matchTypeOptions: MatchType[] = [
  "Friendly",
  "League",
  "Tournament",
  "Knockout",
];

export const matchStatusOptions: MatchStatus[] = [
  "upcoming",
  "completed",
  "cancelled",
];

export const formationOptions: Formation[] = [
  "4-4-2",
  "4-3-3",
  "3-5-2",
  "5-3-2",
  "3-4-3",
  "4-2-3-1",
  "4-5-1",
  "3-4-1-2",
  "3-4-2-1",
  "5-4-1",
  "5-2-3",
];

// ---------------------------------------------------------------------------
// Formation engine — real football positions and pitch layouts
//
// A `Position` is a football role (e.g. "CB"). A `Slot` is a specific place
// on the pitch for one formation (e.g. "CB1" and "CB2" are both centre-backs,
// but distinct slots so two players can occupy the role at once). Every slot
// maps to exactly one position via `slotPosition`; a formation maps its own
// subset of slots to pitch coordinates via `formationLayouts`.
//
// Coordinates are percentages (0-100) of the pitch's width (x) and length
// (y), authored for a portrait pitch with the team attacking upward (y: 90
// GK, y: 10 forwards). `getPitchSlotStyle` (lib/matches.ts) derives the
// landscape rotation from these same numbers, so only one set of coordinates
// needs to be tactically correct.
// ---------------------------------------------------------------------------

export type Position =
  | "GK"
  | "LB"
  | "RB"
  | "CB"
  | "LWB"
  | "RWB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST";

export type Slot =
  | "GK"
  | "LB"
  | "RB"
  | "CB1"
  | "CB2"
  | "CB3"
  | "LWB"
  | "RWB"
  | "CDM"
  | "CDM1"
  | "CDM2"
  | "CM1"
  | "CM2"
  | "CM3"
  | "CAM"
  | "CAM1"
  | "CAM2"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST"
  | "ST1"
  | "ST2";

export type PitchCoordinate = {
  x: number;
  y: number;
};

/**
 * Not every formation uses every slot (a back four has no LWB, a 4-4-2 has no
 * CAM), so a layout is a partial map rather than a full `Record<Slot, ...>`.
 */
export type FormationLayout = Partial<Record<Slot, PitchCoordinate>>;

export const slotPosition: Record<Slot, Position> = {
  GK: "GK",
  LB: "LB",
  RB: "RB",
  CB1: "CB",
  CB2: "CB",
  CB3: "CB",
  LWB: "LWB",
  RWB: "RWB",
  CDM: "CDM",
  CDM1: "CDM",
  CDM2: "CDM",
  CM1: "CM",
  CM2: "CM",
  CM3: "CM",
  CAM: "CAM",
  CAM1: "CAM",
  CAM2: "CAM",
  LM: "LM",
  RM: "RM",
  LW: "LW",
  RW: "RW",
  ST: "ST",
  ST1: "ST",
  ST2: "ST",
};

export const positionLabels: Record<Position, string> = {
  GK: "Goalkeeper",
  LB: "Left Back",
  RB: "Right Back",
  CB: "Centre Back",
  LWB: "Left Wing-Back",
  RWB: "Right Wing-Back",
  CDM: "Defensive Midfielder",
  CM: "Central Midfielder",
  CAM: "Attacking Midfielder",
  LM: "Left Midfielder",
  RM: "Right Midfielder",
  LW: "Left Winger",
  RW: "Right Winger",
  ST: "Striker",
};

export const formationLayouts: Record<Formation, FormationLayout> = {
  "4-4-2": {
    GK: { x: 50, y: 90 },
    LB: { x: 15, y: 70 },
    CB1: { x: 38, y: 72 },
    CB2: { x: 62, y: 72 },
    RB: { x: 85, y: 70 },
    LM: { x: 15, y: 45 },
    CM1: { x: 38, y: 45 },
    CM2: { x: 62, y: 45 },
    RM: { x: 85, y: 45 },
    ST1: { x: 38, y: 15 },
    ST2: { x: 62, y: 15 },
  },

  "4-3-3": {
    GK: { x: 50, y: 90 },
    LB: { x: 15, y: 70 },
    CB1: { x: 38, y: 72 },
    CB2: { x: 62, y: 72 },
    RB: { x: 85, y: 70 },
    CM1: { x: 30, y: 48 },
    CM2: { x: 50, y: 42 },
    CM3: { x: 70, y: 48 },
    LW: { x: 15, y: 16 },
    ST: { x: 50, y: 10 },
    RW: { x: 85, y: 16 },
  },

  "3-5-2": {
    GK: { x: 50, y: 90 },
    CB1: { x: 30, y: 74 },
    CB2: { x: 50, y: 76 },
    CB3: { x: 70, y: 74 },
    LWB: { x: 8, y: 52 },
    CM1: { x: 33, y: 44 },
    CM2: { x: 50, y: 50 },
    CM3: { x: 67, y: 44 },
    RWB: { x: 92, y: 52 },
    ST1: { x: 38, y: 15 },
    ST2: { x: 62, y: 15 },
  },

  "5-3-2": {
    GK: { x: 50, y: 90 },
    LWB: { x: 10, y: 66 },
    CB1: { x: 30, y: 74 },
    CB2: { x: 50, y: 76 },
    CB3: { x: 70, y: 74 },
    RWB: { x: 90, y: 66 },
    CM1: { x: 32, y: 44 },
    CM2: { x: 50, y: 40 },
    CM3: { x: 68, y: 44 },
    ST1: { x: 38, y: 15 },
    ST2: { x: 62, y: 15 },
  },

  "3-4-3": {
    GK: { x: 50, y: 90 },
    CB1: { x: 30, y: 74 },
    CB2: { x: 50, y: 76 },
    CB3: { x: 70, y: 74 },
    LM: { x: 12, y: 48 },
    CM1: { x: 38, y: 45 },
    CM2: { x: 62, y: 45 },
    RM: { x: 88, y: 48 },
    LW: { x: 15, y: 16 },
    ST: { x: 50, y: 10 },
    RW: { x: 85, y: 16 },
  },

  "4-2-3-1": {
    GK: { x: 50, y: 90 },
    LB: { x: 15, y: 70 },
    CB1: { x: 38, y: 72 },
    CB2: { x: 62, y: 72 },
    RB: { x: 85, y: 70 },
    CDM1: { x: 38, y: 55 },
    CDM2: { x: 62, y: 55 },
    LW: { x: 15, y: 30 },
    CAM: { x: 50, y: 25 },
    RW: { x: 85, y: 30 },
    ST: { x: 50, y: 10 },
  },

  "4-5-1": {
    GK: { x: 50, y: 90 },
    LB: { x: 15, y: 70 },
    CB1: { x: 38, y: 72 },
    CB2: { x: 62, y: 72 },
    RB: { x: 85, y: 70 },
    LM: { x: 10, y: 42 },
    CM1: { x: 32, y: 46 },
    CDM: { x: 50, y: 52 },
    CM2: { x: 68, y: 46 },
    RM: { x: 90, y: 42 },
    ST: { x: 50, y: 12 },
  },

  "3-4-1-2": {
    GK: { x: 50, y: 90 },
    CB1: { x: 30, y: 74 },
    CB2: { x: 50, y: 76 },
    CB3: { x: 70, y: 74 },
    LM: { x: 12, y: 50 },
    CM1: { x: 38, y: 46 },
    CM2: { x: 62, y: 46 },
    RM: { x: 88, y: 50 },
    CAM: { x: 50, y: 28 },
    ST1: { x: 38, y: 14 },
    ST2: { x: 62, y: 14 },
  },

  "3-4-2-1": {
    GK: { x: 50, y: 90 },
    CB1: { x: 30, y: 74 },
    CB2: { x: 50, y: 76 },
    CB3: { x: 70, y: 74 },
    LM: { x: 12, y: 50 },
    CM1: { x: 38, y: 46 },
    CM2: { x: 62, y: 46 },
    RM: { x: 88, y: 50 },
    CAM1: { x: 38, y: 28 },
    CAM2: { x: 62, y: 28 },
    ST: { x: 50, y: 12 },
  },

  "5-4-1": {
    GK: { x: 50, y: 90 },
    LWB: { x: 8, y: 66 },
    CB1: { x: 30, y: 74 },
    CB2: { x: 50, y: 76 },
    CB3: { x: 70, y: 74 },
    RWB: { x: 92, y: 66 },
    LM: { x: 15, y: 44 },
    CM1: { x: 38, y: 42 },
    CM2: { x: 62, y: 42 },
    RM: { x: 85, y: 44 },
    ST: { x: 50, y: 12 },
  },

  "5-2-3": {
    GK: { x: 50, y: 90 },
    LWB: { x: 8, y: 66 },
    CB1: { x: 30, y: 74 },
    CB2: { x: 50, y: 76 },
    CB3: { x: 70, y: 74 },
    RWB: { x: 92, y: 66 },
    CM1: { x: 38, y: 48 },
    CM2: { x: 62, y: 48 },
    LW: { x: 15, y: 18 },
    ST: { x: 50, y: 10 },
    RW: { x: 85, y: 18 },
  },
};

type EventTypeConfig = {
  label: string;
  emoji: string;
  icon: LucideIcon;
  colorClass: string;
};

export const eventTypeConfig: Record<MatchEventType, EventTypeConfig> = {
  goal: {
    label: "Goal",
    emoji: "⚽",
    icon: Goal,
    colorClass: "bg-accent text-accent-foreground",
  },
  yellow_card: {
    label: "Yellow Card",
    emoji: "🟨",
    icon: Square,
    colorClass:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
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

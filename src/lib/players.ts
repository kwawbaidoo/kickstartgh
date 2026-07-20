import { format } from "date-fns";

import { positionOptions, type AgeGroup } from "@/config/players";
import type { Player, PlayerStatus, Position } from "@/mock/players";
import type { Match } from "@/mock/matches";
import { getStartingPlayerIds } from "@/lib/matches";

export function getAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function getAgeGroup(dateOfBirth: string): AgeGroup {
  const age = getAge(dateOfBirth);
  if (age < 18) return "Under 18";
  if (age <= 24) return "18-24";
  if (age <= 30) return "25-30";
  return "31+";
}

export type PlayerFilters = {
  search: string;
  position: Position | "All";
  ageGroup: AgeGroup | "All";
  status: PlayerStatus | "All";
};

export const defaultPlayerFilters: PlayerFilters = {
  search: "",
  position: "All",
  ageGroup: "All",
  status: "All",
};

export function filterPlayers(players: Player[], filters: PlayerFilters): Player[] {
  const query = filters.search.trim().toLowerCase();

  return players.filter((player) => {
    if (query) {
      const matchesQuery =
        player.fullName.toLowerCase().includes(query) ||
        player.nickname?.toLowerCase().includes(query) ||
        String(player.jerseyNumber).includes(query);
      if (!matchesQuery) return false;
    }

    if (filters.position !== "All" && player.position !== filters.position) return false;
    if (filters.status !== "All" && player.status !== filters.status) return false;
    if (filters.ageGroup !== "All" && getAgeGroup(player.dateOfBirth) !== filters.ageGroup) {
      return false;
    }

    return true;
  });
}

export type PlayerSort = "name" | "jerseyNumber" | "recent";

export function sortPlayers(players: Player[], sort: PlayerSort): Player[] {
  const sorted = [...players];

  switch (sort) {
    case "jerseyNumber":
      return sorted.sort((a, b) => a.jerseyNumber - b.jerseyNumber);
    case "recent":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "name":
    default:
      return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
}

export type PositionBreakdown = { position: Position; count: number };

export function getPositionBreakdown(players: Player[]): PositionBreakdown[] {
  return positionOptions.map((position) => ({
    position,
    count: players.filter((player) => player.position === position).length,
  }));
}

// ---------------------------------------------------------------------------
// Player activity timeline — a player can be on the squad for years, so this
// spans team-lifecycle events (joined, status changes) and every match-day
// event (appearances, goals, assists, cards), oldest activity last.
// ---------------------------------------------------------------------------

export type PlayerTimelineEventType =
  | "joined"
  | "status"
  | "match"
  | "goal"
  | "assist"
  | "yellow_card"
  | "red_card";

export type PlayerTimelineEntry = {
  id: string;
  date: string;
  type: PlayerTimelineEventType;
  label: string;
  /** Present on match-day entries — lets the UI offer a per-game report. */
  matchId?: string;
  /** Present on "status" entries, so the UI can pick an icon per status. */
  status?: PlayerStatus;
};

export function buildPlayerTimeline(player: Player, matches: Match[]): PlayerTimelineEntry[] {
  const entries: PlayerTimelineEntry[] = [
    { id: "joined", date: player.createdAt, type: "joined", label: "Joined team" },
  ];

  player.statusHistory.slice(1).forEach((change, index) => {
    entries.push({
      id: `status-${index}`,
      date: change.date,
      type: "status",
      label: `Marked as ${change.status}`,
      status: change.status,
    });
  });

  for (const match of matches) {
    if (match.status !== "completed") continue;
    const started = getStartingPlayerIds(match.lineup).includes(player.id);
    const onBench = match.lineup?.substitutes.includes(player.id) ?? false;
    const subbedOn = match.events.some(
      (event) => event.type === "substitution" && event.playerInId === player.id
    );
    if (!started && !onBench && !subbedOn) continue;

    entries.push({
      id: `match-${match.id}`,
      date: match.date,
      type: "match",
      label: `Played vs ${match.opponent}`,
      matchId: match.id,
    });

    for (const event of match.events) {
      if (event.type === "goal" && event.playerId === player.id) {
        entries.push({
          id: `${event.id}-goal`,
          date: match.date,
          type: "goal",
          label: `Scored vs ${match.opponent}`,
          matchId: match.id,
        });
      }
      if (event.type === "goal" && event.assistPlayerId === player.id) {
        entries.push({
          id: `${event.id}-assist`,
          date: match.date,
          type: "assist",
          label: `Assisted vs ${match.opponent}`,
          matchId: match.id,
        });
      }
      if ((event.type === "yellow_card" || event.type === "red_card") && event.playerId === player.id) {
        entries.push({
          id: event.id,
          date: match.date,
          type: event.type,
          label: `${event.type === "yellow_card" ? "Yellow" : "Red"} card vs ${match.opponent}`,
          matchId: match.id,
        });
      }
    }
  }

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export type TimelineGranularity = "all" | "year" | "quarter" | "month";

export const timelineGranularityOptions: TimelineGranularity[] = ["all", "year", "quarter", "month"];

function timelinePeriodKey(date: Date, granularity: TimelineGranularity): string {
  if (granularity === "year") return String(date.getFullYear());
  if (granularity === "quarter") return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
  return format(date, "yyyy-MM");
}

function timelinePeriodLabel(date: Date, granularity: TimelineGranularity): string {
  if (granularity === "year") return String(date.getFullYear());
  if (granularity === "quarter") return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
  return format(date, "MMM yyyy");
}

export type TimelinePeriodOption = { value: string; label: string };

/** Only periods that actually have activity are offered, oldest tenure still filterable without an empty-looking list. */
export function getTimelinePeriodOptions(
  entries: PlayerTimelineEntry[],
  granularity: TimelineGranularity
): TimelinePeriodOption[] {
  if (granularity === "all") return [];

  const seen = new Map<string, string>();
  for (const entry of entries) {
    const date = new Date(entry.date);
    const value = timelinePeriodKey(date, granularity);
    if (!seen.has(value)) seen.set(value, timelinePeriodLabel(date, granularity));
  }
  return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.value < b.value ? 1 : -1
  );
}

export function filterTimelineByPeriod(
  entries: PlayerTimelineEntry[],
  granularity: TimelineGranularity,
  period: string | null
): PlayerTimelineEntry[] {
  if (granularity === "all" || !period) return entries;
  return entries.filter((entry) => timelinePeriodKey(new Date(entry.date), granularity) === period);
}

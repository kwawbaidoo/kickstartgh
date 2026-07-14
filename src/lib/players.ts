import { positionOptions, type AgeGroup } from "@/config/players";
import type { Player, PlayerStatus, Position } from "@/mock/players";

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

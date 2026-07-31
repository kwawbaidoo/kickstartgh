"use client";

import { Calendar, Trophy } from "lucide-react";

import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { useMatchesStore } from "@/store/matches-store";
import { useSeasonStore } from "@/store/season-store";
import { getTeamStats } from "@/lib/matches";
import { getSeasonMatches } from "@/lib/seasons";

type MatchStatisticCardProps = {
  metric: "played" | "wins";
};

function MatchStatisticCard({ metric }: MatchStatisticCardProps) {
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const stats = getTeamStats(matches);

  if (metric === "played") {
    return (
      <StatisticCard title="Matches Played" value={stats.played} icon={<Calendar />} href="/matches" />
    );
  }

  return <StatisticCard title="Wins" value={stats.wins} icon={<Trophy />} href="/matches" />;
}

export { MatchStatisticCard };

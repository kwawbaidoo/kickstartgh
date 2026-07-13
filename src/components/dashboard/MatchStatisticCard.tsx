"use client";

import { Calendar, Trophy } from "lucide-react";

import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { useMatchesStore } from "@/store/matches-store";
import { getTeamStats } from "@/lib/matches";

type MatchStatisticCardProps = {
  metric: "played" | "wins";
};

function MatchStatisticCard({ metric }: MatchStatisticCardProps) {
  const matches = useMatchesStore((state) => state.matches);
  const stats = getTeamStats(matches);

  if (metric === "played") {
    return <StatisticCard title="Matches Played" value={stats.played} icon={<Calendar />} />;
  }

  return <StatisticCard title="Wins" value={stats.wins} icon={<Trophy />} />;
}

export { MatchStatisticCard };

"use client";

import { Percent, Users } from "lucide-react";

import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useSeasonStore } from "@/store/season-store";
import { getAttendanceRanking } from "@/lib/attendance";
import { getSeasonRoster } from "@/lib/players";
import { getSeasonMatches, getSeasonSessions } from "@/lib/seasons";

type PlayerStatisticCardProps = {
  metric: "total" | "attendance";
};

function PlayerStatisticCard({ metric }: PlayerStatisticCardProps) {
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const players = getSeasonRoster(usePlayersStore((state) => state.players), activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const sessions = getSeasonSessions(useAttendanceStore((state) => state.sessions), activeSeasonId);

  if (metric === "total") {
    return <StatisticCard title="Total Players" value={players.length} icon={<Users />} href="/players" />;
  }

  const ranking = getAttendanceRanking(players, sessions, matches);
  const avgAttendance =
    ranking.length > 0
      ? Math.round(
          ranking.reduce((sum, entry) => sum + entry.stats.attendancePercentage, 0) / ranking.length
        )
      : 0;

  return (
    <StatisticCard
      title="Attendance Rate"
      value={`${avgAttendance}%`}
      icon={<Percent />}
      href="/reports/attendance"
    />
  );
}

export { PlayerStatisticCard };

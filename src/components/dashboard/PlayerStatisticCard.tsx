"use client";

import { Percent, Users } from "lucide-react";

import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { getAttendanceRanking } from "@/lib/attendance";

type PlayerStatisticCardProps = {
  metric: "total" | "attendance";
};

function PlayerStatisticCard({ metric }: PlayerStatisticCardProps) {
  const players = usePlayersStore((state) => state.players);
  const matches = useMatchesStore((state) => state.matches);
  const sessions = useAttendanceStore((state) => state.sessions);

  if (metric === "total") {
    return <StatisticCard title="Total Players" value={players.length} icon={<Users />} />;
  }

  const ranking = getAttendanceRanking(players, sessions, matches);
  const avgAttendance =
    ranking.length > 0
      ? Math.round(
          ranking.reduce((sum, entry) => sum + entry.stats.attendancePercentage, 0) / ranking.length
        )
      : 0;

  return (
    <StatisticCard title="Attendance Rate" value={`${avgAttendance}%`} icon={<Percent />} />
  );
}

export { PlayerStatisticCard };

"use client";

import { Percent, Users } from "lucide-react";

import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { usePlayersStore } from "@/store/players-store";

type PlayerStatisticCardProps = {
  metric: "total" | "attendance";
};

function PlayerStatisticCard({ metric }: PlayerStatisticCardProps) {
  const players = usePlayersStore((state) => state.players);

  if (metric === "total") {
    return <StatisticCard title="Total Players" value={players.length} icon={<Users />} />;
  }

  const avgAttendance = Math.round(
    players.reduce((sum, player) => sum + player.stats.attendancePercentage, 0) /
      (players.length || 1)
  );

  return (
    <StatisticCard title="Attendance Rate" value={`${avgAttendance}%`} icon={<Percent />} />
  );
}

export { PlayerStatisticCard };

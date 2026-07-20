"use client";

import { CalendarCheck, Goal, Percent, ShieldCheck, Trophy, Users } from "lucide-react";

import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { Stagger } from "@/components/common/Stagger";
import type { SeasonStats } from "@/lib/seasons";

function SeasonStatsCard({ stats }: { stats: SeasonStats }) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatisticCard title="Registered Players" value={stats.registeredPlayers} icon={<Users />} />
      <StatisticCard title="Matches Played" value={stats.played} icon={<Trophy />} />
      <StatisticCard title="Wins" value={stats.wins} icon={<ShieldCheck />} />
      <StatisticCard title="Win Rate" value={`${stats.winPercentage}%`} icon={<Percent />} />
      <StatisticCard title="Goals For" value={stats.goalsFor} icon={<Goal />} />
      <StatisticCard title="Goals Against" value={stats.goalsAgainst} icon={<Goal />} />
      <StatisticCard title="Training Sessions" value={stats.trainingSessions} icon={<CalendarCheck />} />
      <StatisticCard title="Attendance" value={`${stats.attendancePercentage}%`} icon={<Percent />} />
    </Stagger>
  );
}

export { SeasonStatsCard };

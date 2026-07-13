import {
  Calendar,
  CalendarPlus,
  ClipboardCheck,
  FileBarChart,
  Percent,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";

import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { UpcomingMatchCard } from "@/components/dashboard/UpcomingMatchCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TeamProfileCard } from "@/components/dashboard/TeamProfileCard";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { Stagger } from "@/components/common/Stagger";
import { currentTeam } from "@/mock/teams";
import { getPlayersByTeam } from "@/mock/players";
import { getMatchesByTeam, getMatchResult, getUpcomingMatch } from "@/mock/matches";

const quickActions = [
  { label: "Add Player", icon: <UserPlus />, href: "/players" },
  { label: "Create Match", icon: <CalendarPlus />, href: "/matches" },
  { label: "Record Attendance", icon: <ClipboardCheck />, href: "/attendance" },
  { label: "Generate Report", icon: <FileBarChart />, href: "/reports" },
];

export default function DashboardPage() {
  const players = getPlayersByTeam(currentTeam.id);
  const matches = getMatchesByTeam(currentTeam.id);
  const completedMatches = matches.filter((match) => match.status === "completed");
  const wins = completedMatches.filter((match) => getMatchResult(match) === "win").length;
  const avgAttendance = Math.round(
    players.reduce((sum, player) => sum + player.stats.attendancePercentage, 0) /
      (players.length || 1)
  );
  const upcomingMatch = getUpcomingMatch(currentTeam.id);

  return (
    <div className="flex flex-col gap-8">
      <DashboardGreeting />

      <TeamProfileCard />

      <section className="flex flex-col gap-3">
        <SectionHeader title="Team Overview" />
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatisticCard title="Total Players" value={players.length} icon={<Users />} />
          <StatisticCard
            title="Matches Played"
            value={completedMatches.length}
            icon={<Calendar />}
          />
          <StatisticCard title="Wins" value={wins} icon={<Trophy />} />
          <StatisticCard
            title="Attendance Rate"
            value={`${avgAttendance}%`}
            icon={<Percent />}
          />
        </Stagger>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Quick Actions" />
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.href} {...action} />
          ))}
        </Stagger>
      </section>

      {upcomingMatch && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Upcoming Match" />
          <div className="max-w-md">
            <UpcomingMatchCard
              opponent={upcomingMatch.opponent}
              date={upcomingMatch.date}
              venue={upcomingMatch.venue}
              competition={upcomingMatch.competition}
            />
          </div>
        </section>
      )}
    </div>
  );
}

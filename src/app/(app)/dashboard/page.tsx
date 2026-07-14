import { CalendarPlus, ClipboardCheck, FileBarChart, UserPlus } from "lucide-react";

import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { PlayerStatisticCard } from "@/components/dashboard/PlayerStatisticCard";
import { MatchStatisticCard } from "@/components/dashboard/MatchStatisticCard";
import { UpcomingMatchCard } from "@/components/dashboard/UpcomingMatchCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TeamProfileCard } from "@/components/dashboard/TeamProfileCard";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { Stagger } from "@/components/common/Stagger";

const quickActions = [
  { label: "Add Player", icon: <UserPlus />, href: "/players/new" },
  { label: "Create Match", icon: <CalendarPlus />, href: "/matches/new" },
  { label: "Record Attendance", icon: <ClipboardCheck />, href: "/training" },
  { label: "Generate Report", icon: <FileBarChart />, href: "/reports" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardGreeting />

      <TeamProfileCard />

      <section className="flex flex-col gap-3">
        <SectionHeader title="Team Overview" />
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <PlayerStatisticCard metric="total" />
          <MatchStatisticCard metric="played" />
          <MatchStatisticCard metric="wins" />
          <PlayerStatisticCard metric="attendance" />
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

      <UpcomingMatchCard />
    </div>
  );
}

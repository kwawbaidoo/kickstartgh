"use client";

import { CalendarPlus, ClipboardCheck, FileBarChart, UserPlus } from "lucide-react";

import { QuickActionsBar, type QuickAction } from "@/components/dashboard/QuickActionsBar";
import { PlayerStatisticCard } from "@/components/dashboard/PlayerStatisticCard";
import { MatchStatisticCard } from "@/components/dashboard/MatchStatisticCard";
import { ResultsBreakdownChart } from "@/components/dashboard/ResultsBreakdownChart";
import { AttackDefenceChart } from "@/components/dashboard/AttackDefenceChart";
import { SquadCompositionChart } from "@/components/dashboard/SquadCompositionChart";
import { UpcomingMatchesSection } from "@/components/dashboard/UpcomingMatchesSection";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TeamProfileCard } from "@/components/dashboard/TeamProfileCard";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { Stagger } from "@/components/common/Stagger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchesStore } from "@/store/matches-store";
import { usePlayersStore } from "@/store/players-store";
import { getMonthlyGoals, getTeamStats } from "@/lib/matches";
import { getPositionBreakdown } from "@/lib/players";

const quickActions: QuickAction[] = [
  { label: "Add Player", icon: <UserPlus />, href: "/players/new" },
  { label: "Create Match", icon: <CalendarPlus />, href: "/matches/new" },
  { label: "Record Attendance", icon: <ClipboardCheck />, href: "/training" },
  { label: "Generate Report", icon: <FileBarChart />, href: "/reports" },
];

export default function DashboardPage() {
  const matches = useMatchesStore((state) => state.matches);
  const players = usePlayersStore((state) => state.players);
  const teamStats = getTeamStats(matches);
  const monthlyGoals = getMonthlyGoals(matches);
  const positionBreakdown = getPositionBreakdown(players);

  return (
    <div className="flex flex-col gap-8">
      <DashboardGreeting />

      <QuickActionsBar actions={quickActions} />

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
        <SectionHeader title="Team Performance" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Results Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsBreakdownChart wins={teamStats.wins} draws={teamStats.draws} losses={teamStats.losses} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Attacks vs Defence (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <AttackDefenceChart data={monthlyGoals} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Squad Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <SquadCompositionChart data={positionBreakdown} />
            </CardContent>
          </Card>
        </div>
      </section>

      <UpcomingMatchesSection />
    </div>
  );
}

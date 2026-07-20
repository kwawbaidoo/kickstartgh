"use client";

import { use } from "react";
import Link from "next/link";
import { CalendarDays, ChartColumn, ClipboardList, Settings, Shield, Trophy, Users } from "lucide-react";
import { format } from "date-fns";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { Stagger } from "@/components/common/Stagger";
import { SeasonStatsCard } from "@/components/seasons/SeasonStatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { seasonStatusBadgeClasses, seasonStatusLabels } from "@/config/seasons";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonStats } from "@/lib/seasons";
import { cn, getInitials } from "@/lib/utils";

export default function SeasonDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seasons = useSeasonStore((state) => state.seasons);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const players = usePlayersStore((state) => state.players);
  const matches = useMatchesStore((state) => state.matches);
  const sessions = useAttendanceStore((state) => state.sessions);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);

  const season = seasons.find((candidate) => candidate.id === id);

  if (!season) {
    return (
      <EmptyState
        icon={Trophy}
        title="Season not found."
        description="This season may have been removed."
        actionLabel="Back to Seasons"
        actionHref="/seasons"
      />
    );
  }

  const isActive = season.id === activeSeasonId;
  const stats = getSeasonStats(season, players, matches, sessions);
  const manager = activeTeam.staff.find((member) => member.role === "teamManager");
  const headCoach = activeTeam.staff.find((member) => member.role === "headCoach");

  const sections = [
    { label: "Players", icon: <Users />, href: `/seasons/${id}/players` },
    { label: "Matches", icon: <Trophy />, href: `/seasons/${id}/matches` },
    { label: "Training", icon: <ClipboardList />, href: `/seasons/${id}/training` },
    { label: "Reports", icon: <ChartColumn />, href: `/seasons/${id}/reports` },
    { label: "Analytics", icon: <ChartColumn />, href: `/seasons/${id}/analytics` },
    { label: "Settings", icon: <Settings />, href: `/seasons/${id}/settings` },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={season.name}
        description={season.competitionCategory ?? "Season overview"}
        action={
          <Link
            href={`/seasons/${id}/settings`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Settings />
            Manage Season
          </Link>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-semibold text-primary-foreground">
              {activeTeam.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeTeam.logo} alt="" className="size-full object-cover" />
              ) : (
                getInitials(activeTeam.name)
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-semibold text-foreground">
                  {activeTeam.name}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    seasonStatusBadgeClasses[season.status]
                  )}
                >
                  {seasonStatusLabels[season.status]}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {format(new Date(season.startDate), "d MMM yyyy")} –{" "}
                {format(new Date(season.endDate), "d MMM yyyy")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:text-right">
            {manager && (
              <span className="flex items-center gap-1 sm:justify-end">
                <Shield className="size-3.5" />
                Manager: <span className="font-medium text-foreground">{manager.fullName}</span>
              </span>
            )}
            {headCoach && (
              <span className="flex items-center gap-1 sm:justify-end">
                <Shield className="size-3.5" />
                Head Coach: <span className="font-medium text-foreground">{headCoach.fullName}</span>
              </span>
            )}
            {!manager && !headCoach && <span>No manager or head coach assigned yet.</span>}
          </div>
        </CardContent>
      </Card>

      {!isActive && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          This season is {seasonStatusLabels[season.status].toLowerCase()} — its players, matches, and
          training are read-only. Activate it from Settings to make changes.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <SectionHeader title="Season Overview" />
        <SeasonStatsCard stats={stats} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Manage This Season" />
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {sections.map((section) => (
            <QuickActionCard key={section.label} {...section} />
          ))}
        </Stagger>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchesTable } from "@/components/matches/MatchesTable";
import { ViewToggle, type CardListView } from "@/components/common/ViewToggle";
import { getUpcomingMatches } from "@/mock/matches";
import { currentTeam } from "@/mock/teams";
import { useMatchesStore } from "@/store/matches-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonMatches } from "@/lib/seasons";

const DISPLAY_LIMIT = 4;

function UpcomingMatchesSection() {
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const [view, setView] = useState<CardListView>("card");
  const allUpcomingMatches = getUpcomingMatches(currentTeam.id, matches);
  const upcomingMatches = allUpcomingMatches.slice(0, DISPLAY_LIMIT);

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Upcoming Matches"
        action={
          upcomingMatches.length > 0 ? (
            <div className="flex items-center gap-2">
              {allUpcomingMatches.length > DISPLAY_LIMIT && (
                <Link href="/matches" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              )}
              <ViewToggle value={view} onChange={setView} />
            </div>
          ) : undefined
        }
      />

      {upcomingMatches.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming matches."
          description="Create your first fixture to start tracking results."
          actionLabel="Create Match"
          actionHref="/matches/new"
        />
      ) : view === "card" ? (
        <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </Stagger>
      ) : (
        <MatchesTable matches={upcomingMatches} />
      )}
    </section>
  );
}

export { UpcomingMatchesSection };

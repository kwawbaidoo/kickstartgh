"use client";

import { useState } from "react";
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

function UpcomingMatchesSection() {
  const matches = useMatchesStore((state) => state.matches);
  const [view, setView] = useState<CardListView>("card");
  const upcomingMatches = getUpcomingMatches(currentTeam.id, matches, 4);

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Upcoming Matches"
        action={upcomingMatches.length > 0 ? <ViewToggle value={view} onChange={setView} /> : undefined}
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

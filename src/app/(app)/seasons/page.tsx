"use client";

import Link from "next/link";
import { Plus, Trophy } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { ListRowSkeleton } from "@/components/common/LoadingSkeleton";
import { SeasonCard } from "@/components/seasons/SeasonCard";
import { buttonVariants } from "@/components/ui/button";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonStats } from "@/lib/seasons";

export default function SeasonsPage() {
  const seasons = useSeasonStore((state) => state.seasons);
  const hasHydrated = useSeasonStore((state) => state.hasHydrated);
  const players = usePlayersStore((state) => state.players);
  const matches = useMatchesStore((state) => state.matches);
  const sessions = useAttendanceStore((state) => state.sessions);

  const sortedSeasons = [...seasons].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <ListRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Seasons"
        description="Every season your club has run, with players, matches, and training kept separate."
        action={
          <Link href="/seasons/new" className={buttonVariants({ size: "sm" })}>
            <Plus />
            Create Season
          </Link>
        }
      />

      {seasons.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No seasons yet."
          description="Create your first season to start registering players and scheduling matches."
          actionLabel="Create Season"
          actionHref="/seasons/new"
        />
      ) : (
        <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSeasons.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              stats={getSeasonStats(season, players, matches, sessions)}
            />
          ))}
        </Stagger>
      )}
    </div>
  );
}

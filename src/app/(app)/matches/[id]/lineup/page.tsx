"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LineupBuilder } from "@/components/matches/LineupBuilder";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { getSeasonRecord, getSeasonRoster } from "@/lib/players";
import type { Lineup } from "@/mock/matches";

export default function MatchLineupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const matches = useMatchesStore((state) => state.matches);
  const setLineup = useMatchesStore((state) => state.setLineup);
  const players = usePlayersStore((state) => state.players);
  const match = matches.find((candidate) => candidate.id === id);
  const [error, setError] = useState<string | null>(null);

  if (!match) {
    return (
      <EmptyState
        title="Match not found."
        description="This fixture may have been removed."
        actionLabel="Back to matches"
        actionHref="/matches"
      />
    );
  }

  const squad = getSeasonRoster(players, match.season_id).filter(
    (player) => getSeasonRecord(player, match.season_id)?.status === "Active"
  );

  function handleSave(lineup: Lineup) {
    setError(null);
    setLineup(id, lineup)
      .then(() => router.push(`/matches/${id}`))
      .catch(() => setError("Couldn't save the lineup. Please try again."));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={`/matches/${id}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Match
      </Link>
      <SectionHeader title="Build Lineup" description={`vs ${match.opponent} · ${match.venue}`} />
      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <LineupBuilder squad={squad} initialLineup={match.lineup} onSave={handleSave} />
    </div>
  );
}

"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LineupBuilder } from "@/components/matches/LineupBuilder";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import type { Lineup } from "@/mock/matches";

export default function MatchLineupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const matches = useMatchesStore((state) => state.matches);
  const setLineup = useMatchesStore((state) => state.setLineup);
  const players = usePlayersStore((state) => state.players);
  const match = matches.find((candidate) => candidate.id === id);

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

  const squad = players.filter((player) => player.status === "Active");

  function handleSave(lineup: Lineup) {
    setLineup(id, lineup);
    router.push(`/matches/${id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Build Lineup" description={`vs ${match.opponent} · ${match.venue}`} />
      <LineupBuilder squad={squad} initialLineup={match.lineup} onSave={handleSave} />
    </div>
  );
}

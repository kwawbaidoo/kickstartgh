"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LineupBuilder } from "@/components/matches/LineupBuilder";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getSeasonRecord, getSeasonRoster } from "@/lib/players";
import type { Lineup } from "@/mock/matches";

export default function MatchLineupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const matches = useMatchesStore((state) => state.matches);
  const setLineup = useMatchesStore((state) => state.setLineup);
  const players = usePlayersStore((state) => state.players);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
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

  const squad = getSeasonRoster(players, match.seasonId).filter(
    (player) => getSeasonRecord(player, match.seasonId)?.status === "Active"
  );

  function handleSave(lineup: Lineup) {
    setLineup(id, lineup);
    router.push(`/matches/${id}`);
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
      <LineupBuilder
        squad={squad}
        staff={activeTeam.staff}
        initialLineup={match.lineup}
        onSave={handleSave}
      />
    </div>
  );
}

"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MatchForm } from "@/components/matches/MatchForm";
import { useMatchesStore } from "@/store/matches-store";
import { getCompetitions } from "@/lib/matches";
import type { MatchFormInput } from "@/schemas/match";

export default function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const matches = useMatchesStore((state) => state.matches);
  const updateMatch = useMatchesStore((state) => state.updateMatch);
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

  function handleSubmit(data: MatchFormInput) {
    updateMatch(id, data);
    router.push(`/matches/${id}`);
  }

  const defaultValues: Partial<MatchFormInput> = {
    opponent: match.opponent,
    competition: match.competition,
    matchType: match.matchType,
    venue: match.venue,
    homeAway: match.isHome ? "Home" : "Away",
    date: match.date,
    kickoffTime: match.kickoffTime,
    referee: match.referee,
    notes: match.notes,
    poster: match.poster,
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Edit Match" description={`Update details for vs ${match.opponent}.`} />
      <MatchForm
        competitions={getCompetitions(matches)}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}

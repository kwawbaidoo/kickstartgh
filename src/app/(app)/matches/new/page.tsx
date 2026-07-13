"use client";

import { useRouter } from "next/navigation";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MatchForm } from "@/components/matches/MatchForm";
import { useMatchesStore } from "@/store/matches-store";
import { getCompetitions } from "@/lib/matches";
import type { MatchFormInput } from "@/schemas/match";

export default function NewMatchPage() {
  const router = useRouter();
  const matches = useMatchesStore((state) => state.matches);
  const addMatch = useMatchesStore((state) => state.addMatch);

  function handleSubmit(data: MatchFormInput) {
    const match = addMatch(data);
    router.push(`/matches/${match.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Create Match" description="Schedule a new fixture." />
      <MatchForm
        competitions={getCompetitions(matches)}
        onSubmit={handleSubmit}
        submitLabel="Create Match"
      />
    </div>
  );
}

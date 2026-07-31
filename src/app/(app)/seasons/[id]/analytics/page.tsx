"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SeasonAnalytics } from "@/components/seasons/SeasonAnalytics";
import { SeasonComparison } from "@/components/seasons/SeasonComparison";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonRoster } from "@/lib/players";
import { getSeasonMatches, getSeasonSessions, getSeasonStats } from "@/lib/seasons";

export default function SeasonAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seasons = useSeasonStore((state) => state.seasons);
  const allPlayers = usePlayersStore((state) => state.players);
  const allMatches = useMatchesStore((state) => state.matches);
  const allSessions = useAttendanceStore((state) => state.sessions);
  const [comparing, setComparing] = useState(false);
  const [compareSeasonId, setCompareSeasonId] = useState<string | null>(null);

  const season = seasons.find((candidate) => candidate.id === id);

  if (!season) {
    return (
      <EmptyState
        title="Season not found."
        description="This season may have been removed."
        actionLabel="Back to Seasons"
        actionHref="/seasons"
      />
    );
  }

  const seasonPlayers = getSeasonRoster(allPlayers, id);
  const seasonMatches = getSeasonMatches(allMatches, id);
  const seasonSessions = getSeasonSessions(allSessions, id);

  const otherSeasons = seasons.filter((candidate) => candidate.id !== id);
  const compareSeason = seasons.find((candidate) => candidate.id === compareSeasonId);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/seasons/${id}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {season.name}
      </Link>

      <SectionHeader
        title={`${season.name} — Analytics`}
        description="Performance trends and standout players this season."
        action={
          otherSeasons.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setComparing((current) => !current);
                if (comparing) setCompareSeasonId(null);
              }}
            >
              {comparing ? "Hide Comparison" : "Compare Seasons"}
            </Button>
          ) : undefined
        }
      />

      {comparing && (
        <div className="flex flex-col gap-3">
          <Select
            items={Object.fromEntries(otherSeasons.map((candidate) => [candidate.id, candidate.name]))}
            value={compareSeasonId}
            onValueChange={setCompareSeasonId}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Compare with a season" />
            </SelectTrigger>
            <SelectContent>
              {otherSeasons.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {compareSeason && (
            <SeasonComparison
              seasonA={season}
              statsA={getSeasonStats(season, allPlayers, allMatches, allSessions)}
              seasonB={compareSeason}
              statsB={getSeasonStats(compareSeason, allPlayers, allMatches, allSessions)}
            />
          )}
        </div>
      )}

      <SeasonAnalytics
        seasonId={id}
        players={seasonPlayers}
        matches={seasonMatches}
        sessions={seasonSessions}
      />
    </div>
  );
}

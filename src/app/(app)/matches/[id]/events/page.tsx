"use client";

import { use } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { EventRecorder } from "@/components/matches/EventRecorder";
import { MatchTimeline } from "@/components/matches/MatchTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";

export default function MatchEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matches = useMatchesStore((state) => state.matches);
  const addEvent = useMatchesStore((state) => state.addEvent);
  const removeEvent = useMatchesStore((state) => state.removeEvent);
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

  if (!match.lineup) {
    return (
      <EmptyState
        title="Build your lineup first."
        description="You need a starting XI before recording match events."
        actionLabel="Build Lineup"
        actionHref={`/matches/${id}/lineup`}
      />
    );
  }

  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.fullName]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Record Events" description={`vs ${match.opponent}`} />

      <EventRecorder
        lineup={match.lineup}
        squad={players}
        events={match.events}
        onRecord={(event) => addEvent(id, event)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchTimeline
            events={match.events}
            playerNames={playerNames}
            onRemove={(eventId) => removeEvent(id, eventId)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

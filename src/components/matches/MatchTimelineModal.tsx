"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { MatchTimeline } from "@/components/matches/MatchTimeline";
import type { Match } from "@/mock/matches";
import { usePlayersStore } from "@/store/players-store";

function MatchTimelineModal({ match }: { match: Match }) {
  const [open, setOpen] = useState(false);
  const players = usePlayersStore((state) => state.players);
  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.fullName]));

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" variant="ghost" size="icon-sm" aria-label="View timeline">
          <Eye className="size-4" />
        </Button>
      }
      title="Match Timeline"
      description={`vs ${match.opponent}`}
    >
      <MatchTimeline events={match.events} playerNames={playerNames} />
    </Modal>
  );
}

export { MatchTimelineModal };

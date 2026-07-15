"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Users } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { LineupView } from "@/components/matches/LineupView";
import type { Match } from "@/mock/matches";
import { usePlayersStore } from "@/store/players-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { resolveBenchOfficials } from "@/lib/matches";
import { exportLineupPdf } from "@/lib/export";

function MatchLineupModal({ match }: { match: Match }) {
  const [open, setOpen] = useState(false);
  const players = usePlayersStore((state) => state.players);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);

  function handleDownload() {
    if (!match.lineup) return;
    const benchOfficials = resolveBenchOfficials(match.lineup.benchOfficials, activeTeam.staff);
    exportLineupPdf(match, activeTeam, players, benchOfficials);
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" variant="ghost" size="icon-sm" aria-label="View lineup">
          <Users className="size-4" />
        </Button>
      }
      title="Lineup"
      description={`vs ${match.opponent}`}
    >
      {match.lineup ? (
        <div className="flex flex-col gap-4">
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <LineupView lineup={match.lineup} players={players} staff={activeTeam.staff} />
          </div>
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download />
            Download Lineup
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">No lineup has been set for this match yet.</p>
          <Link
            href={`/matches/${match.id}/lineup`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Build Lineup
          </Link>
        </div>
      )}
    </Modal>
  );
}

export { MatchLineupModal };

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { PlayerImportWizard } from "@/components/players/PlayerImportWizard";
import { usePlayersStore } from "@/store/players-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonRoster } from "@/lib/players";

export default function ImportPlayersPage() {
  const allPlayers = usePlayersStore((state) => state.players);
  const bulkUploadPlayers = usePlayersStore((state) => state.bulkUploadPlayers);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  // Jersey clashes are checked against the active season's roster, the same scope the
  // single-player form uses — a number freed up between seasons isn't a conflict.
  const players = getSeasonRoster(allPlayers, activeSeasonId);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href="/players"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Players
      </Link>
      <SectionHeader
        title="Import Players"
        description="Add your whole squad at once from an Excel or CSV file."
      />
      <PlayerImportWizard existingPlayers={players} onImport={bulkUploadPlayers} />
    </div>
  );
}

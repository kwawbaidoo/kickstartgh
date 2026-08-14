"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PlayerForm } from "@/components/players/PlayerForm";
import { usePlayersStore } from "@/store/players-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonRoster } from "@/lib/players";
import type { PlayerFormInput } from "@/schemas/player";

export default function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const allPlayers = usePlayersStore((state) => state.players);
  const updatePlayer = usePlayersStore((state) => state.updatePlayer);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const players = getSeasonRoster(allPlayers, activeSeasonId);
  const player = players.find((candidate) => candidate.id === id);

  if (!player) {
    return (
      <EmptyState
        title="Player not found."
        description="This player may have been removed."
        actionLabel="Back to squad"
        actionHref="/players"
      />
    );
  }

  function handleSubmit(data: PlayerFormInput) {
    updatePlayer(id, data);
    router.push(`/players/${id}`);
  }

  const defaultValues: Partial<PlayerFormInput> = {
    full_name: player.full_name,
    nickname: player.nickname,
    date_of_birth: player.date_of_birth,
    photo: player.photo,
    phone: player.phone,
    email: player.email,
    emergency_contact: player.emergency_contact,
    jersey_number: player.jersey_number,
    position: player.position,
    secondary_position: player.secondary_position,
    preferred_foot: player.preferred_foot,
    village: player.village,
    previous_club: player.previous_club,
    status: player.status,
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/players"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Players
      </Link>
      <SectionHeader title="Edit Player" description={`Update ${player.full_name}'s details.`} />
      <PlayerForm
        existingPlayers={players}
        excludeId={id}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}

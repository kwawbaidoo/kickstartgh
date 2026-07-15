"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PlayerForm } from "@/components/players/PlayerForm";
import { usePlayersStore } from "@/store/players-store";
import type { PlayerFormInput } from "@/schemas/player";

export default function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const players = usePlayersStore((state) => state.players);
  const updatePlayer = usePlayersStore((state) => state.updatePlayer);
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
    fullName: player.fullName,
    nickname: player.nickname,
    dateOfBirth: player.dateOfBirth,
    photo: player.photo,
    phone: player.phone,
    email: player.email,
    emergencyContact: player.emergencyContact,
    jerseyNumber: player.jerseyNumber,
    position: player.position,
    secondaryPosition: player.secondaryPosition,
    preferredFoot: player.preferredFoot,
    village: player.village,
    previousClub: player.previousClub,
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
      <SectionHeader title="Edit Player" description={`Update ${player.fullName}'s details.`} />
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

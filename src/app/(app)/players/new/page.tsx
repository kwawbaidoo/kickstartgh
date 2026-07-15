"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { PlayerForm } from "@/components/players/PlayerForm";
import { usePlayersStore } from "@/store/players-store";
import type { PlayerFormInput } from "@/schemas/player";

export default function NewPlayerPage() {
  const router = useRouter();
  const players = usePlayersStore((state) => state.players);
  const addPlayer = usePlayersStore((state) => state.addPlayer);

  function handleSubmit(data: PlayerFormInput) {
    const player = addPlayer(data);
    router.push(`/players/${player.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/players"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Players
      </Link>
      <SectionHeader title="Add Player" description="Register a new player to your squad." />
      <PlayerForm existingPlayers={players} onSubmit={handleSubmit} submitLabel="Register Player" />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MessageCircle, MoreVertical, Pencil, ShieldCheck, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { statusOptions } from "@/config/players";
import type { Player } from "@/mock/players";
import { usePlayersStore } from "@/store/players-store";
import { useOnboardingStore } from "@/store/onboarding-store";

function PlayerActionsMenu({ player }: { player: Player }) {
  const deletePlayer = usePlayersStore((state) => state.deletePlayer);
  const setPlayerStatus = usePlayersStore((state) => state.setPlayerStatus);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareMessage = [
    "⚽ Player Profile",
    "",
    "Name:",
    player.full_name,
    "",
    "Position:",
    player.position,
    "",
    "Team:",
    teamName,
  ].join("\n");

  function handleDelete() {
    setError(null);
    deletePlayer(player.id)
      .then(() => setDeleteOpen(false))
      .catch(() => setError("Couldn't remove this player. Please try again."));
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" />}>
          <MoreVertical className="size-4" />
          <span className="sr-only">More actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/players/${player.id}`} />}>
            <Eye />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/players/${player.id}/edit`} />}>
            <Pencil />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ShieldCheck />
              Change Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {statusOptions.map((status) => (
                <DropdownMenuItem key={status} onClick={() => setPlayerStatus(player.id, status).catch(() => {})}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircle />
            Share Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Remove Player
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove this player?"
        description={`${player.full_name} will be removed from your squad. This can't be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remove Player
            </Button>
          </>
        }
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Modal>
    </>
  );
}

export { PlayerActionsMenu };

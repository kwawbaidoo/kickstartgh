import Link from "next/link";
import { Pencil } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PlayerActionsMenu } from "@/components/players/PlayerActionsMenu";
import type { Player } from "@/mock/players";

function PlayerQuickActions({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/players/${player.id}/edit`}
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        aria-label="Edit player"
      >
        <Pencil className="size-4" />
      </Link>
      <PlayerActionsMenu player={player} />
    </div>
  );
}

export { PlayerQuickActions };

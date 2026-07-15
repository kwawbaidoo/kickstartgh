import Link from "next/link";

import type { Player } from "@/mock/players";
import { statusBadgeClasses } from "@/config/players";
import { TableCell, TableRow } from "@/components/ui/table";
import { PlayerQuickActions } from "@/components/players/PlayerQuickActions";
import { cn, getInitials } from "@/lib/utils";

function PlayerListRow({ player }: { player: Player }) {
  return (
    <TableRow>
      <TableCell>
        <Link href={`/players/${player.id}`} className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(player.fullName)
            )}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">{player.fullName}</span>
            {player.nickname && (
              <span className="truncate text-xs text-muted-foreground">&ldquo;{player.nickname}&rdquo;</span>
            )}
          </span>
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{player.position}</TableCell>
      <TableCell className="text-muted-foreground">#{player.jerseyNumber}</TableCell>
      <TableCell>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
            statusBadgeClasses[player.status]
          )}
        >
          {player.status}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end">
          <PlayerQuickActions player={player} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export { PlayerListRow };

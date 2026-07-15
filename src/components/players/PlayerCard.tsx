"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { Player } from "@/mock/players";
import { statusBadgeClasses } from "@/config/players";
import { PlayerQuickActions } from "@/components/players/PlayerQuickActions";
import { fadeInUp } from "@/lib/motion";
import { cn, getInitials } from "@/lib/utils";

function PlayerCard({ player }: { player: Player }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-colors hover:ring-foreground/20"
    >
      <Link href={`/players/${player.id}`} className="flex flex-col items-center gap-2 text-center">
        <div className="relative">
          <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(player.fullName)
            )}
          </div>
          <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-card">
            {player.jerseyNumber}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="truncate text-xs font-medium text-foreground">{player.fullName}</span>
          <span className="truncate text-[11px] text-muted-foreground">
            {player.nickname ? `"${player.nickname}" · ` : ""}
            {player.position}
          </span>
        </div>

        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            statusBadgeClasses[player.status]
          )}
        >
          {player.status}
        </span>
      </Link>

      <div className="flex items-center justify-center gap-1 border-t border-border pt-2">
        <PlayerQuickActions player={player} />
      </div>
    </motion.div>
  );
}

export { PlayerCard };

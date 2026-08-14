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
      className="flex flex-col gap-1.5 rounded-xl bg-card p-2.5 ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-none dark:ring-foreground/10 dark:hover:ring-foreground/20"
    >
      <Link href={`/players/${player.id}`} className="flex flex-col items-center gap-1.5 text-center">
        <div className="relative">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(player.full_name)
            )}
          </div>
          <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground ring-2 ring-card">
            {player.jersey_number}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="truncate text-xs font-medium text-foreground">{player.full_name}</span>
          <span className="truncate text-[10px] text-muted-foreground">
            {player.nickname ? `"${player.nickname}" · ` : ""}
            {player.position}
          </span>
        </div>

        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
            statusBadgeClasses[player.status]
          )}
        >
          {player.status}
        </span>
      </Link>

      <div className="flex items-center justify-center gap-1 border-t border-border pt-1.5">
        <PlayerQuickActions player={player} />
      </div>
    </motion.div>
  );
}

export { PlayerCard };

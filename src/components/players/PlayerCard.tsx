"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { Player } from "@/mock/players";
import { statusBadgeClasses } from "@/config/players";
import { fadeInUp } from "@/lib/motion";
import { cn, getInitials } from "@/lib/utils";

function PlayerCard({ player }: { player: Player }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link
        href={`/players/${player.id}`}
        className="flex flex-col items-center gap-3 rounded-xl bg-card p-4 text-center ring-1 ring-foreground/10 transition-colors hover:ring-foreground/20"
      >
        <div className="relative">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-semibold text-primary-foreground">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(player.fullName)
            )}
          </div>
          <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground ring-2 ring-card">
            {player.jerseyNumber}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{player.fullName}</span>
          <span className="text-xs text-muted-foreground">
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
    </motion.div>
  );
}

export { PlayerCard };

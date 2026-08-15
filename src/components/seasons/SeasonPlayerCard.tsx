"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import type { Player, PlayerStatus } from "@/mock/players";
import { statusBadgeClasses } from "@/config/players";
import { fadeInUp } from "@/lib/motion";
import { cn, getInitials } from "@/lib/utils";

type SeasonPlayerCardProps = {
  player: Player;
  jersey_number: number;
  status: PlayerStatus;
  onRemove?: () => void;
};

/**
 * Shows this player's jersey number/status *for this season* — never the
 * top-level Player.jersey_number/status mirror, which only ever reflects the
 * active season (see lib/players.ts's getSeasonRecord). That's why this is
 * a separate component from the shared PlayerCard rather than reusing it.
 */
function SeasonPlayerCard({ player, jersey_number, status, onRemove }: SeasonPlayerCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="relative flex flex-col gap-1.5 rounded-xl bg-card p-2.5 ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-none dark:ring-foreground/10 dark:hover:ring-foreground/20"
    >
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${player.full_name} from season`}
          className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-destructive"
        >
          <X className="size-3.5" />
        </button>
      )}
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
            {jersey_number}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="truncate text-xs font-medium text-foreground">{player.full_name}</span>
          <span className="truncate text-[10px] text-muted-foreground">{player.position}</span>
        </div>

        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
            statusBadgeClasses[status]
          )}
        >
          {status}
        </span>
      </Link>
    </motion.div>
  );
}

export { SeasonPlayerCard };

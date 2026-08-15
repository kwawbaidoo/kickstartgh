"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, MapPin } from "lucide-react";

import type { Match, MatchResult } from "@/mock/matches";
import { getMatchResult } from "@/mock/matches";
import { MatchQuickActions } from "@/components/matches/MatchQuickActions";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const resultBadgeClasses: Record<MatchResult, string> = {
  win: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  draw: "bg-muted text-muted-foreground",
  loss: "bg-destructive/10 text-destructive",
};

function MatchCard({ match }: { match: Match }) {
  const result = getMatchResult(match);

  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-none dark:ring-foreground/10 dark:hover:ring-foreground/20"
    >
      <Link href={`/matches/${match.id}`} className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-medium text-muted-foreground">
            {match.competition}
          </span>
          {match.status === "completed" && result && (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                resultBadgeClasses[result]
              )}
            >
              {result}
            </span>
          )}
          {match.status === "upcoming" && (
            <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-accent-foreground">
              Upcoming
            </span>
          )}
          {match.status === "cancelled" && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
              Cancelled
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-foreground">vs {match.opponent}</span>
          {match.status === "completed" && (
            <span className="shrink-0 font-heading text-base font-semibold text-foreground">
              {match.team_score}–{match.opponent_score}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {format(new Date(match.date), "d MMM yyyy")}
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{match.venue}</span>
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-end gap-1 border-t border-border pt-1.5">
        <MatchQuickActions match={match} />
      </div>
    </motion.div>
  );
}

export { MatchCard };

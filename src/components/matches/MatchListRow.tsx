import Link from "next/link";
import { format } from "date-fns";

import type { Match, MatchResult } from "@/mock/matches";
import { getMatchResult } from "@/mock/matches";
import { TableCell, TableRow } from "@/components/ui/table";
import { MatchQuickActions } from "@/components/matches/MatchQuickActions";
import { cn } from "@/lib/utils";

const resultBadgeClasses: Record<MatchResult, string> = {
  win: "bg-emerald-500 text-white",
  draw: "bg-muted text-foreground",
  loss: "bg-destructive text-white",
};

const resultLabel: Record<MatchResult, string> = { win: "W", draw: "D", loss: "L" };

function MatchListRow({ match }: { match: Match }) {
  const result = getMatchResult(match);

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{format(new Date(match.date), "d MMM")}</TableCell>
      <TableCell>
        <Link href={`/matches/${match.id}`} className="font-medium text-foreground hover:text-primary">
          {match.opponent}
        </Link>
      </TableCell>
      <TableCell>
        <span className="rounded-full border border-input px-2 py-0.5 text-xs text-foreground">
          {match.isHome ? "Home" : "Away"}
        </span>
      </TableCell>
      <TableCell className="font-medium text-foreground">
        {match.status === "completed"
          ? `${match.teamScore}–${match.opponentScore}`
          : match.status === "cancelled"
            ? "—"
            : "vs"}
      </TableCell>
      <TableCell>
        {match.status === "completed" && result ? (
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md text-xs font-bold",
              resultBadgeClasses[result]
            )}
          >
            {resultLabel[result]}
          </span>
        ) : match.status === "upcoming" ? (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
            Upcoming
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            Cancelled
          </span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{match.competition}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end">
          <MatchQuickActions match={match} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export { MatchListRow };

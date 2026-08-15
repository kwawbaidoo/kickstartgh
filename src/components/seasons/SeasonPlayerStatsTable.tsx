"use client";

import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SeasonPlayerStats } from "@/lib/seasons";
import { cn, getInitials } from "@/lib/utils";

type SeasonPlayerStatsTableProps = {
  stats: SeasonPlayerStats[];
};

function CardCount({ count, tone }: { count: number; tone: "amber" | "red" }) {
  if (count === 0) return <span className="text-muted-foreground">0</span>;
  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold",
        tone === "amber"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {count}
    </span>
  );
}

function SeasonPlayerStatsTable({ stats }: SeasonPlayerStatsTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10 sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-center">MP</TableHead>
              <TableHead className="text-center">G</TableHead>
              <TableHead className="text-center">A</TableHead>
              <TableHead className="text-center">YC</TableHead>
              <TableHead className="text-center">RC</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((entry) => (
              <TableRow key={entry.player.id}>
                <TableCell>
                  <Link
                    href={`/players/${entry.player.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {entry.player.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.player.photo} alt="" className="size-full object-cover" />
                      ) : (
                        getInitials(entry.player.full_name)
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {entry.player.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">#{entry.jersey_number}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{entry.player.position}</TableCell>
                <TableCell className="text-center">{entry.matchesPlayed}</TableCell>
                <TableCell className="text-center font-semibold text-foreground">
                  {entry.goals}
                </TableCell>
                <TableCell className="text-center">{entry.assists}</TableCell>
                <TableCell className="text-center">
                  <CardCount count={entry.yellowCards} tone="amber" />
                </TableCell>
                <TableCell className="text-center">
                  <CardCount count={entry.redCards} tone="red" />
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {entry.attendancePercentage}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden">
        {stats.map((entry) => (
          <Link
            key={entry.player.id}
            href={`/players/${entry.player.id}`}
            className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {entry.player.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.player.photo} alt="" className="size-full object-cover" />
                  ) : (
                    getInitials(entry.player.full_name)
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {entry.player.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.player.position} · #{entry.jersey_number}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-foreground">
                {entry.attendancePercentage}%
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/60 px-2 py-1.5 text-center text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">{entry.matchesPlayed}</span>
                <span className="text-muted-foreground">MP</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">{entry.goals}</span>
                <span className="text-muted-foreground">Goals</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">{entry.assists}</span>
                <span className="text-muted-foreground">Assists</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">
                  {entry.yellowCards}Y {entry.redCards}R
                </span>
                <span className="text-muted-foreground">Cards</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export { SeasonPlayerStatsTable };

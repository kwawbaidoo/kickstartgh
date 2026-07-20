"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Season } from "@/mock/seasons";
import type { SeasonStats } from "@/lib/seasons";

type ComparisonRow = { label: string; a: string | number; b: string | number };

type SeasonComparisonProps = {
  seasonA: Season;
  statsA: SeasonStats;
  seasonB: Season;
  statsB: SeasonStats;
};

function SeasonComparison({ seasonA, statsA, seasonB, statsB }: SeasonComparisonProps) {
  const rows: ComparisonRow[] = [
    { label: "Registered Players", a: statsA.registeredPlayers, b: statsB.registeredPlayers },
    { label: "Matches Played", a: statsA.played, b: statsB.played },
    { label: "Wins", a: statsA.wins, b: statsB.wins },
    { label: "Draws", a: statsA.draws, b: statsB.draws },
    { label: "Losses", a: statsA.losses, b: statsB.losses },
    { label: "Win Rate", a: `${statsA.winPercentage}%`, b: `${statsB.winPercentage}%` },
    { label: "Goals For", a: statsA.goalsFor, b: statsB.goalsFor },
    { label: "Goals Against", a: statsA.goalsAgainst, b: statsB.goalsAgainst },
    { label: "Training Sessions", a: statsA.trainingSessions, b: statsB.trainingSessions },
    { label: "Attendance", a: `${statsA.attendancePercentage}%`, b: `${statsB.attendancePercentage}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Comparison</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="grid grid-cols-3 gap-2 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <span></span>
          <span className="truncate text-right">{seasonA.name}</span>
          <span className="truncate text-right">{seasonB.name}</span>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-3 gap-2 border-t border-border py-2 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="text-right font-medium text-foreground">{row.a}</span>
            <span className="text-right font-medium text-foreground">{row.b}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { SeasonComparison };

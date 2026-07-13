import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerMatchStats } from "@/lib/matches";

type PlayerStatsCardProps = {
  stats: PlayerMatchStats & { attendancePercentage: number; rating: number };
};

function PlayerStatsCard({ stats }: PlayerStatsCardProps) {
  const items = [
    { label: "Matches", value: stats.matchesPlayed },
    { label: "Goals", value: stats.goals },
    { label: "Assists", value: stats.assists },
    { label: "Attendance", value: `${stats.attendancePercentage}%` },
    { label: "Rating", value: stats.rating.toFixed(1) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 text-center">
              <span className="font-heading text-xl font-semibold text-foreground">
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { PlayerStatsCard };

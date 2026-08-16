import Link from "next/link";
import { Phone, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayerFacts } from "@/components/players/PlayerFacts";
import type { Player } from "@/mock/players";
import type { Season } from "@/mock/seasons";

type PlayerInfoCardProps = {
  player: Player;
  seasons: Season[];
};

function PlayerInfoCard({ player, seasons }: PlayerInfoCardProps) {
  const rows = [{ icon: Phone, label: "Phone", value: player.phone || "Not provided" }];

  const registeredSeasons = player.season_records
    .map((record) => seasons.find((season) => season.id === record.season_id))
    .filter((season): season is Season => !!season);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <PlayerFacts player={player} />

        {registeredSeasons.length > 0 && (
          <>
            <Separator className="my-1" />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Seasons
              </span>
              <div className="flex flex-wrap gap-2">
                {registeredSeasons.map((season) => (
                  <Link
                    key={season.id}
                    href={`/seasons/${season.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/70"
                  >
                    <Trophy className="size-3.5 text-muted-foreground" />
                    {season.name}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator className="my-1" />

        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <row.icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="w-32 shrink-0 text-muted-foreground">{row.label}</span>
              <span className="font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <Separator className="my-1" />

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Emergency Contact
          </span>
          <span className="text-sm font-medium text-foreground">
            {player.emergency_contact || "Not provided"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export { PlayerInfoCard };

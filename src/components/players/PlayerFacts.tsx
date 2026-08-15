import { format } from "date-fns";
import { Cake, MapPin, Shirt } from "lucide-react";

import type { Player } from "@/mock/players";
import { getAge } from "@/lib/players";

type PlayerFactsProps = {
  player: Player;
};

/**
 * Quick facts grid + personal details — deliberately excludes contact/
 * emergency info, so it's safe to reuse on both the coach-facing player page
 * and the public shareable profile.
 */
function PlayerFacts({ player }: PlayerFactsProps) {
  const quickFacts = [
    { label: "Age", value: `${getAge(player.date_of_birth)} years old` },
    {
      label: "Position",
      value: player.secondary_position ? `${player.position} / ${player.secondary_position}` : player.position,
    },
    { label: "Preferred foot", value: player.preferred_foot },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 sm:grid-cols-3">
        {quickFacts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{fact.label}</span>
            <span className="text-sm font-medium text-foreground">{fact.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm">
          <Cake className="size-4 shrink-0 text-muted-foreground" />
          <span className="w-32 shrink-0 text-muted-foreground">Date of birth</span>
          <span className="font-medium text-foreground">
            {format(new Date(player.date_of_birth), "d MMM yyyy")}
          </span>
        </div>
        {player.village && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-muted-foreground">Location</span>
            <span className="font-medium text-foreground">{player.village}</span>
          </div>
        )}
        {player.previous_club && (
          <div className="flex items-center gap-3 text-sm">
            <Shirt className="size-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-muted-foreground">Previous club</span>
            <span className="font-medium text-foreground">{player.previous_club}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { PlayerFacts };

import { Card, CardContent } from "@/components/ui/card";
import { statusBadgeClasses } from "@/config/players";
import type { Player } from "@/mock/players";
import { cn, getInitials } from "@/lib/utils";

type PlayerProfileHeaderProps = {
  player: Player;
};

function PlayerProfileHeader({ player }: PlayerProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
        <div className="relative shrink-0">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(player.fullName)
            )}
          </div>
          <span className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground ring-4 ring-card">
            {player.jerseyNumber}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 sm:items-start">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            {player.fullName}
            {player.nickname && (
              <span className="ml-1.5 text-base font-normal text-muted-foreground">
                &ldquo;{player.nickname}&rdquo;
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {player.position}
            {player.secondaryPosition && ` / ${player.secondaryPosition}`}
          </p>
          <span
            className={cn(
              "mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              statusBadgeClasses[player.status]
            )}
          >
            {player.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export { PlayerProfileHeader };

import { statusBadgeClasses } from "@/config/players";
import type { Player } from "@/mock/players";
import { cn } from "@/lib/utils";

type PlayerProfileHeaderProps = {
  player: Player;
};

/** The photo lives in PlayerPhotoPanel — this is just the name/position/status identity row. */
function PlayerProfileHeader({ player }: PlayerProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{player.fullName}</h1>
        {player.nickname && (
          <span className="text-base font-normal text-muted-foreground">
            &ldquo;{player.nickname}&rdquo;
          </span>
        )}
        <span
          className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusBadgeClasses[player.status])}
        >
          {player.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {player.position}
        {player.secondaryPosition && ` / ${player.secondaryPosition}`}
        {" · "}#{player.jerseyNumber}
      </p>
    </div>
  );
}

export { PlayerProfileHeader };

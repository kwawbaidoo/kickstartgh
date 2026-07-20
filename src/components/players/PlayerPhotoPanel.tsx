import type { Player } from "@/mock/players";
import { cn, getInitials } from "@/lib/utils";

type PlayerPhotoPanelProps = {
  player: Player;
  className?: string;
};

/**
 * The large photo pane reused by the coach-facing player page and the
 * public shareable profile — both put this on a sticky/non-scrolling side
 * with the rest of the profile scrolling past it.
 */
function PlayerPhotoPanel({ player, className }: PlayerPhotoPanelProps) {
  return (
    <div className={cn("relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-primary", className)}>
      {player.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.photo} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-6xl font-semibold text-primary-foreground">
          {getInitials(player.fullName)}
        </div>
      )}
      <span className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-accent text-base font-bold text-accent-foreground ring-4 ring-background">
        {player.jerseyNumber}
      </span>
    </div>
  );
}

export { PlayerPhotoPanel };

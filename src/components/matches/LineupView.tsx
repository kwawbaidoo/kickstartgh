import type { Lineup } from "@/mock/matches";
import type { Player } from "@/mock/players";
import type { StaffMember } from "@/schemas/onboarding";
import { getFormationSlots, resolveBenchOfficials } from "@/lib/matches";
import { getInitials } from "@/lib/utils";

type LineupViewProps = {
  lineup: Lineup;
  players: Player[];
  staff: StaffMember[];
};

function LineupView({ lineup, players, staff }: LineupViewProps) {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const slots = getFormationSlots(lineup.formation);
  const substitutePlayers = lineup.substitutes
    .map((id) => playerMap.get(id))
    .filter((player): player is Player => !!player);
  const benchOfficials = resolveBenchOfficials(lineup.benchOfficials, staff);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Formation</span>
        <span className="text-sm text-muted-foreground">{lineup.formation}</span>
      </div>

      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-700">
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/30" />
        <div className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
        {slots.map((slot, index) => {
          const playerId = lineup.startingXI[index];
          const player = playerId ? playerMap.get(playerId) : undefined;
          if (!player) return null;
          return (
            <div
              key={index}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-white/70">
                {getInitials(player.fullName)}
              </div>
              <span className="max-w-16 truncate rounded bg-black/40 px-1 text-[10px] font-medium text-white">
                {player.fullName.split(" ")[0]}
                {lineup.captainId === player.id ? " (C)" : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Substitutes</span>
        {substitutePlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No substitutes named.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {substitutePlayers.map((player) => (
              <div key={player.id} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {getInitials(player.fullName)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{player.fullName}</span>
                <span className="text-xs text-muted-foreground">#{player.jerseyNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Bench Officials</span>
        {benchOfficials.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bench officials named.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {benchOfficials.map((official) => (
              <div key={official.id} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {getInitials(official.fullName)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{official.fullName}</span>
                <span className="text-xs text-muted-foreground">{official.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { LineupView };

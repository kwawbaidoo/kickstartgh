import type { MatchEvent } from "@/mock/matches";
import { eventTypeConfig } from "@/config/matches";
import { describeEvent } from "@/lib/matches";
import { cn } from "@/lib/utils";

type MatchTimelineProps = {
  events: MatchEvent[];
  playerNames: Record<string, string>;
  onRemove?: (eventId: string) => void;
};

function MatchTimeline({ events, playerNames, onRemove }: MatchTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No events recorded yet.</p>;
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((event) => {
        const config = eventTypeConfig[event.type];
        return (
          <div key={event.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full [&>svg]:size-4",
                config.colorClass
              )}
            >
              <config.icon />
            </div>
            <span className="w-9 shrink-0 text-xs font-medium text-muted-foreground">
              {event.minute}&apos;
            </span>
            <span className="flex-1 text-sm text-foreground">
              {describeEvent(event, playerNames)}
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(event.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
                aria-label="Remove event"
              >
                Undo
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { MatchTimeline };

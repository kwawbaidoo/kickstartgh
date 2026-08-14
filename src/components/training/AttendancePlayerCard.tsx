"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { attendanceStatusConfig, attendanceStatusOptions } from "@/config/training";
import type { AttendanceStatus } from "@/mock/attendance";
import type { Player } from "@/mock/players";
import { cn, getInitials } from "@/lib/utils";

const SWIPE_THRESHOLD = 60;

type AttendancePlayerCardProps = {
  player: Player;
  status?: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus) => void;
  selected: boolean;
  onToggleSelect: () => void;
};

function AttendancePlayerCard({
  player,
  status,
  onStatusChange,
  selected,
  onToggleSelect,
}: AttendancePlayerCardProps) {
  const startX = useRef<number | null>(null);

  function handlePointerDown(event: ReactPointerEvent) {
    startX.current = event.clientX;
  }

  function handlePointerUp(event: ReactPointerEvent) {
    if (startX.current === null) return;
    const deltaX = event.clientX - startX.current;
    startX.current = null;
    if (deltaX > SWIPE_THRESHOLD) onStatusChange("present");
    else if (deltaX < -SWIPE_THRESHOLD) onStatusChange("absent");
  }

  return (
    <div
      className="flex touch-pan-y items-center gap-2 rounded-xl bg-card p-2 ring-1 ring-foreground/10"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onToggleSelect}
        aria-label={`Select ${player.full_name}`}
      />
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {player.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo} alt="" className="size-full object-cover" />
        ) : (
          getInitials(player.full_name)
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{player.full_name}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          #{player.jersey_number} · {player.position}
        </span>
      </div>
      <div className="flex shrink-0 gap-1">
        {attendanceStatusOptions.map((option) => {
          const config = attendanceStatusConfig[option];
          const isActive = status === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onStatusChange(option)}
              aria-pressed={isActive}
              aria-label={config.label}
              title={config.label}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                isActive ? config.colorClass : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <config.icon className="size-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { AttendancePlayerCard };

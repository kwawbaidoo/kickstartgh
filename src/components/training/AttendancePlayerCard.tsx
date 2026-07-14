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
    <div className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      <div
        className="flex touch-pan-y items-center gap-3"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${player.fullName}`}
        />
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {player.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.photo} alt="" className="size-full object-cover" />
          ) : (
            getInitials(player.fullName)
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{player.fullName}</span>
          <span className="truncate text-xs text-muted-foreground">
            #{player.jerseyNumber} · {player.position}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
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
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors",
                isActive ? config.colorClass : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <config.icon className="size-4" />
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { AttendancePlayerCard };

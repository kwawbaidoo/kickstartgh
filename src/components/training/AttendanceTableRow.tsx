"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { attendanceStatusConfig, attendanceStatusOptions } from "@/config/training";
import type { AttendanceStatus } from "@/mock/attendance";
import type { Player } from "@/mock/players";
import { cn, getInitials } from "@/lib/utils";

type AttendanceTableRowProps = {
  player: Player;
  status?: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus) => void;
  selected: boolean;
  onToggleSelect: () => void;
};

function AttendanceTableRow({
  player,
  status,
  onStatusChange,
  selected,
  onToggleSelect,
}: AttendanceTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${player.fullName}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(player.fullName)
            )}
          </div>
          <span className="truncate font-medium text-foreground">{player.fullName}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{player.position}</TableCell>
      <TableCell className="text-muted-foreground">#{player.jerseyNumber}</TableCell>
      <TableCell>
        <div className="flex gap-1">
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
      </TableCell>
    </TableRow>
  );
}

export { AttendanceTableRow };

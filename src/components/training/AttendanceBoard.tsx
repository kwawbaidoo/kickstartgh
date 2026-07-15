"use client";

import { useMemo, useState } from "react";

import { AttendancePlayerCard } from "@/components/training/AttendancePlayerCard";
import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attendanceStatusConfig, attendanceStatusOptions } from "@/config/training";
import type { AttendanceStatus } from "@/mock/attendance";
import type { Player } from "@/mock/players";
import { toSelectItems } from "@/lib/utils";

const bulkStatusItems = toSelectItems(
  attendanceStatusOptions.map((option) => ({ value: option, label: attendanceStatusConfig[option].label }))
);

type AttendanceBoardProps = {
  players: Player[];
  records: Record<string, AttendanceStatus>;
  onSetAttendance: (playerId: string, status: AttendanceStatus) => void;
  onSetBulkAttendance: (playerIds: string[], status: AttendanceStatus) => void;
};

function AttendanceBoard({ players, records, onSetAttendance, onSetBulkAttendance }: AttendanceBoardProps) {
  const [search, setSearch] = useState("");
  const [unmarkedOnly, setUnmarkedOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus>("present");

  const markedCount = players.filter((player) => records[player.id]).length;
  const unmarkedCount = players.length - markedCount;

  const visiblePlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players.filter((player) => {
      if (unmarkedOnly && records[player.id]) return false;
      if (!query) return true;
      return (
        player.fullName.toLowerCase().includes(query) || String(player.jerseyNumber).includes(query)
      );
    });
  }, [players, records, search, unmarkedOnly]);

  function toggleSelect(playerId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  function handleApplyToSelected() {
    if (selected.size === 0) return;
    onSetBulkAttendance(Array.from(selected), bulkStatus);
    setSelected(new Set());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {markedCount} of {players.length} marked
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSetBulkAttendance(visiblePlayers.map((player) => player.id), "present")}
        >
          Mark all present
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or jersey number" />
        <label className="flex shrink-0 items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm text-foreground">
          <Checkbox
            checked={unmarkedOnly}
            onCheckedChange={(checked) => setUnmarkedOnly(checked === true)}
          />
          Unmarked only
          {unmarkedCount > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {unmarkedCount}
            </span>
          )}
        </label>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2">
          <span className="shrink-0 text-xs text-muted-foreground">{selected.size} selected</span>
          <Select
            items={bulkStatusItems}
            value={bulkStatus}
            onValueChange={(value) => setBulkStatus((value ?? "present") as AttendanceStatus)}
          >
            <SelectTrigger className="h-8 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {attendanceStatusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {attendanceStatusConfig[option].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" size="sm" onClick={handleApplyToSelected}>
            Apply
          </Button>
        </div>
      )}

      {visiblePlayers.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {unmarkedOnly ? "Everyone is marked. 🎉" : "No players match your search."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visiblePlayers.map((player) => (
            <AttendancePlayerCard
              key={player.id}
              player={player}
              status={records[player.id]}
              onStatusChange={(status) => onSetAttendance(player.id, status)}
              selected={selected.has(player.id)}
              onToggleSelect={() => toggleSelect(player.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { AttendanceBoard };

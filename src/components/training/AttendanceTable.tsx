"use client";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AttendanceTableRow } from "@/components/training/AttendanceTableRow";
import type { AttendanceStatus } from "@/mock/attendance";
import type { Player } from "@/mock/players";

type AttendanceTableProps = {
  players: Player[];
  records: Record<string, AttendanceStatus>;
  selected: Set<string>;
  onToggleSelect: (playerId: string) => void;
  onToggleSelectAll: () => void;
  onStatusChange: (playerId: string, status: AttendanceStatus) => void;
};

function AttendanceTable({
  players,
  records,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onStatusChange,
}: AttendanceTableProps) {
  const allSelected = players.length > 0 && players.every((player) => selected.has(player.id));

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all visible players"
              />
            </TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Jersey #</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <AttendanceTableRow
              key={player.id}
              player={player}
              status={records[player.id]}
              selected={selected.has(player.id)}
              onToggleSelect={() => onToggleSelect(player.id)}
              onStatusChange={(status) => onStatusChange(player.id, status)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { AttendanceTable };

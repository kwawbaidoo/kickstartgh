import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayerListRow } from "@/components/players/PlayerListRow";
import type { Player } from "@/mock/players";

function PlayersTable({ players }: { players: Player[] }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Jersey #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <PlayerListRow key={player.id} player={player} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { PlayersTable };

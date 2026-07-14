import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MatchListRow } from "@/components/matches/MatchListRow";
import type { Match } from "@/mock/matches";

function MatchesTable({ matches }: { matches: Match[] }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Opponent</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Competition</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <MatchListRow key={match.id} match={match} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { MatchesTable };

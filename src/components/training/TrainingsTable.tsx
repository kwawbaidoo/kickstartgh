import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingListRow } from "@/components/training/TrainingListRow";
import type { AttendanceSession } from "@/mock/attendance";

function TrainingsTable({ sessions }: { sessions: AttendanceSession[] }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Focus</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TrainingListRow key={session.id} session={session} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { TrainingsTable };

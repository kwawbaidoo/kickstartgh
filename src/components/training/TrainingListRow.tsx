import Link from "next/link";
import { format } from "date-fns";

import type { AttendanceSession } from "@/mock/attendance";
import { TableCell, TableRow } from "@/components/ui/table";
import { sessionStatusBadgeClasses, trainingFocusIcon } from "@/config/training";
import { cn } from "@/lib/utils";

function TrainingListRow({ session }: { session: AttendanceSession }) {
  const FocusIcon = session.focus ? trainingFocusIcon[session.focus] : null;

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">
        {format(new Date(session.date), "d MMM yyyy")}
      </TableCell>
      <TableCell>
        <Link href={`/training/${session.id}`} className="font-medium text-foreground hover:text-primary">
          {session.title}
        </Link>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {FocusIcon && <FocusIcon className="size-3.5 shrink-0" />}
          {session.focus ?? "—"}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">{session.venue}</TableCell>
      <TableCell>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
            sessionStatusBadgeClasses[session.status]
          )}
        >
          {session.status}
        </span>
      </TableCell>
    </TableRow>
  );
}

export { TrainingListRow };

"use client";

import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ImportRow } from "@/lib/player-import";
import { cn } from "@/lib/utils";

type ImportPreviewTableProps = {
  rows: ImportRow[];
  /** True when no Status column was mapped, so every row falls back to the default. */
  statusDefaulted: boolean;
};

function rowSeverity(row: ImportRow): "error" | "warning" | "ok" {
  if (row.issues.some((issue) => issue.severity === "error")) return "error";
  if (row.issues.length > 0) return "warning";
  return "ok";
}

function ImportPreviewTable({ rows, statusDefaulted }: ImportPreviewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-center">Jersey</TableHead>
          <TableHead>Date of birth</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Foot</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const severity = rowSeverity(row);

          return (
            <TableRow
              key={row.sheetRow}
              className={cn(
                severity === "error" && "bg-destructive/5",
                severity === "warning" && "bg-warning/5"
              )}
            >
              <TableCell className="text-xs text-muted-foreground">{row.sheetRow}</TableCell>
              <TableCell className="font-medium text-foreground">
                {row.values.full_name || <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {Number.isInteger(row.values.jersey_number) ? row.values.jersey_number : "—"}
              </TableCell>
              <TableCell className="tabular-nums">{row.values.date_of_birth || "—"}</TableCell>
              <TableCell>{row.values.position ?? "—"}</TableCell>
              <TableCell>{row.values.preferred_foot ?? "—"}</TableCell>
              <TableCell>
                {row.values.status}
                {statusDefaulted && (
                  <span className="text-muted-foreground"> (default)</span>
                )}
              </TableCell>
              <TableCell className="min-w-56">
                {severity === "ok" ? (
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                    Ready
                  </span>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {row.issues.map((issue, index) => (
                      <li
                        key={`${issue.field ?? "row"}-${index}`}
                        className={cn(
                          "flex items-start gap-1.5 text-xs",
                          issue.severity === "error" ? "text-destructive" : "text-warning"
                        )}
                      >
                        {issue.severity === "error" ? (
                          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                        ) : (
                          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                        )}
                        <span className="whitespace-normal">{issue.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export { ImportPreviewTable };

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ReportTable } from "@/lib/reports";

const PAGE_SIZE = 10;

type ReportPreviewProps = {
  table: ReportTable;
};

function ReportPreview({ table }: ReportPreviewProps) {
  const [page, setPage] = useState(0);

  if (table.columns.length === 0) {
    return (
      <p className="rounded-xl bg-muted/60 px-4 py-8 text-center text-sm text-muted-foreground">
        Select at least one column to preview the report.
      </p>
    );
  }

  if (table.rows.length === 0) {
    return (
      <p className="rounded-xl bg-muted/60 px-4 py-8 text-center text-sm text-muted-foreground">
        No rows match your filters yet.
      </p>
    );
  }

  const pageCount = Math.ceil(table.rows.length / PAGE_SIZE);
  const pageRows = table.rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div id="report-preview" className="flex flex-col gap-3">
      {/* Desktop / print table */}
      <div className="hidden overflow-x-auto rounded-xl ring-1 ring-foreground/10 sm:block print:block">
        <Table>
          <TableHeader>
            <TableRow>
              {table.columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, index) => (
              <TableRow key={index}>
                {table.columns.map((column) => (
                  <TableCell key={column.key}>{row[column.key] ?? "—"}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 sm:hidden print:hidden">
        {pageRows.map((row, index) => (
          <div key={index} className="flex flex-col gap-1.5 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
            {table.columns.map((column) => (
              <div key={column.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{column.label}</span>
                <span className="font-medium text-foreground">{row[column.key] ?? "—"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between print:hidden">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {pageCount} · {table.rows.length} rows
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={page === pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ReportPreview };

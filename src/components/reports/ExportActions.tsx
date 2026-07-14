"use client";

import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ExportFormat } from "@/config/reports";
import type { ReportTable } from "@/lib/reports";
import { exportReportCsv, exportReportExcel, exportReportPdf } from "@/lib/export";

type ExportActionsProps = {
  table: ReportTable;
  filename: string;
  title: string;
  onExport?: (format: ExportFormat) => void;
};

function ExportActions({ table, filename, title, onExport }: ExportActionsProps) {
  const disabled = table.columns.length === 0 || table.rows.length === 0;

  function handlePdf() {
    exportReportPdf(table, filename, title);
    onExport?.("PDF");
  }

  function handleExcel() {
    exportReportExcel(table, filename);
    onExport?.("Excel");
  }

  function handleCsv() {
    exportReportCsv(table, filename);
    onExport?.("CSV");
  }

  function handlePrint() {
    window.print();
    onExport?.("Print");
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={handlePdf}>
        <FileText />
        Export PDF
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={handleExcel}>
        <FileSpreadsheet />
        Export Excel
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={handleCsv}>
        <Download />
        Export CSV
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={handlePrint}>
        <Printer />
        Print
      </Button>
    </div>
  );
}

export { ExportActions };

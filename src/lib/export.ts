import { jsPDF } from "jspdf";
import { utils, writeFile } from "xlsx";
import { format } from "date-fns";

import type { ReportTable } from "@/lib/reports";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportCsv(table: ReportTable, filename: string) {
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = table.columns.map((column) => escapeCell(column.label)).join(",");
  const rows = table.rows.map((row) =>
    table.columns.map((column) => escapeCell(row[column.key] ?? "")).join(",")
  );
  const csv = [header, ...rows].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export function exportReportExcel(table: ReportTable, filename: string) {
  const data = table.rows.map((row) => {
    const record: Record<string, string> = {};
    for (const column of table.columns) {
      record[column.label] = row[column.key] ?? "";
    }
    return record;
  });
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Report");
  writeFile(workbook, `${filename}.xlsx`);
}

function truncateForColumn(text: string, colWidthMm: number): string {
  const maxChars = Math.max(4, Math.floor(colWidthMm / 1.8));
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

export function exportReportPdf(table: ReportTable, filename: string, title: string) {
  const doc = new jsPDF({ orientation: table.columns.length > 6 ? "landscape" : "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const colWidth = usableWidth / table.columns.length;
  let y = margin;

  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${format(new Date(), "d MMM yyyy, HH:mm")}`, margin, y);
  y += 8;
  doc.setTextColor(0);

  function drawHeaderRow() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    table.columns.forEach((column, index) => {
      doc.text(truncateForColumn(column.label, colWidth), margin + index * colWidth, y);
    });
    y += 5;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
  }

  drawHeaderRow();

  for (const row of table.rows) {
    if (y > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeaderRow();
    }
    table.columns.forEach((column, index) => {
      doc.text(truncateForColumn(String(row[column.key] ?? ""), colWidth), margin + index * colWidth, y);
    });
    y += 6;
  }

  doc.save(`${filename}.pdf`);
}

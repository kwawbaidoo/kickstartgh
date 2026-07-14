"use client";

import { useSearchParams } from "next/navigation";

import type { ReportType } from "@/config/reports";
import { useReportsStore } from "@/store/reports-store";

/** Resolves the `?template=<id>` query param (set by the Reports home page) to that template's columns. */
export function useInitialReportColumns(reportType: ReportType, defaultColumns: string[]): string[] {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  if (!templateId) return defaultColumns;

  const template = useReportsStore
    .getState()
    .templates.find((candidate) => candidate.id === templateId && candidate.reportType === reportType);

  return template?.columns ?? defaultColumns;
}

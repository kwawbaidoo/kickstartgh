"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { FilterPanel } from "@/components/reports/FilterPanel";
import { ColumnSelector } from "@/components/reports/ColumnSelector";
import { ReportWizard } from "@/components/reports/ReportWizard";
import { SavedTemplates } from "@/components/reports/SavedTemplates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attendanceReportColumns, attendanceReportDefaultColumns } from "@/config/reports";
import { attendancePeriodOptions, type AttendancePeriod } from "@/lib/attendance";
import { useInitialReportColumns } from "@/hooks/useInitialReportColumns";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useReportsStore } from "@/store/reports-store";
import { buildAttendanceReportTable } from "@/lib/reports";

const periodLabels: Record<AttendancePeriod, string> = {
  weekly: "This Week",
  monthly: "This Month",
  seasonal: "This Season",
};

export default function AttendanceReportPage() {
  const players = usePlayersStore((state) => state.players);
  const matches = useMatchesStore((state) => state.matches);
  const sessions = useAttendanceStore((state) => state.sessions);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const addHistoryEntry = useReportsStore((state) => state.addHistoryEntry);

  const [period, setPeriod] = useState<AttendancePeriod>("monthly");
  const [columns, setColumns] = useState<string[]>(
    useInitialReportColumns("attendance", attendanceReportDefaultColumns)
  );

  const table = buildAttendanceReportTable(players, sessions, matches, period, columns);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Attendance Report" description="Training and match attendance ranking." />

      <ReportWizard
        filename="attendance-report"
        title={`${teamName} — Attendance Report`}
        table={table}
        onExport={(format) => addHistoryEntry("attendance", format)}
        filtersSlot={
          <FilterPanel>
            <Select
              items={periodLabels}
              value={period}
              onValueChange={(value) => setPeriod((value ?? "monthly") as AttendancePeriod)}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {attendancePeriodOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {periodLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterPanel>
        }
        columnsSlot={
          <ColumnSelector allColumns={attendanceReportColumns} selected={columns} onChange={setColumns} />
        }
      />

      <SavedTemplates
        reportType="attendance"
        currentColumns={columns}
        onApply={(template) => setColumns(template.columns)}
      />
    </div>
  );
}

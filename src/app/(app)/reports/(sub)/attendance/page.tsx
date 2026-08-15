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
import { useSeasonStore } from "@/store/season-store";
import { buildAttendanceReportTable } from "@/lib/reports";
import { getSeasonRoster } from "@/lib/players";
import { getSeasonMatches, getSeasonSessions } from "@/lib/seasons";

const periodLabels: Record<AttendancePeriod, string> = {
  weekly: "This Week",
  monthly: "This Month",
  seasonal: "This Season",
};

export default function AttendanceReportPage() {
  const activeSeason = useSeasonStore((state) =>
    state.seasons.find((season) => season.id === state.activeSeasonId)
  );
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const players = getSeasonRoster(usePlayersStore((state) => state.players), activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const sessions = getSeasonSessions(useAttendanceStore((state) => state.sessions), activeSeasonId);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const addHistoryEntry = useReportsStore((state) => state.addHistoryEntry);

  const [period, setPeriod] = useState<AttendancePeriod>("monthly");
  const [columns, setColumns] = useState<string[]>(
    useInitialReportColumns("attendance", attendanceReportDefaultColumns)
  );

  const table = buildAttendanceReportTable(players, sessions, matches, period, columns);

  return (
    <>
      <SectionHeader title="Attendance Report" description="Training and match attendance ranking." />
      {activeSeason && (
        <p className="text-xs text-muted-foreground">
          Reporting on: <span className="font-medium text-foreground">{activeSeason.name}</span>
        </p>
      )}

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
        report_type="attendance"
        currentColumns={columns}
        onApply={(template) => setColumns(template.columns)}
      />
    </>
  );
}

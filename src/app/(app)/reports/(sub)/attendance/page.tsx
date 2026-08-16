"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { FilterPanel } from "@/components/reports/FilterPanel";
import { ColumnSelector } from "@/components/reports/ColumnSelector";
import { ReportWizard } from "@/components/reports/ReportWizard";
import { SavedTemplates } from "@/components/reports/SavedTemplates";
import { attendanceReportColumns, attendanceReportDefaultColumns } from "@/config/reports";
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

  const [columns, setColumns] = useState<string[]>(
    useInitialReportColumns("attendance", attendanceReportDefaultColumns)
  );

  const table = buildAttendanceReportTable(players, sessions, matches, columns);

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
        onExport={(format) => addHistoryEntry("attendance", format).catch(() => {})}
        filtersSlot={
          <FilterPanel>
            <p className="text-sm text-muted-foreground">
              Attendance reports always cover the full season, so every session counts.
            </p>
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

"use client";

import { CalendarDays, ClipboardCheck, FileBarChart, Shield, Users } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ExportCard } from "@/components/settings/ExportCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useReportsStore } from "@/store/reports-store";
import {
  buildAttendanceReportTable,
  buildMatchReportTable,
  buildPlayerReportTable,
  buildTeamReportTable,
  defaultMatchReportFilters,
  defaultPlayerReportFilters,
  type ReportTable,
} from "@/lib/reports";
import {
  matchReportColumns,
  playerReportColumns,
  teamReportColumns,
  attendanceReportColumns,
} from "@/config/reports";

export default function DataExportPage() {
  const players = usePlayersStore((state) => state.players);
  const matches = useMatchesStore((state) => state.matches);
  const sessions = useAttendanceStore((state) => state.sessions);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const historyEntries = useReportsStore((state) => state.history);
  const addHistoryEntry = useReportsStore((state) => state.addHistoryEntry);

  const playerTable = buildPlayerReportTable(
    players,
    matches,
    sessions,
    defaultPlayerReportFilters,
    playerReportColumns.map((column) => column.key)
  );

  const teamTable = buildTeamReportTable(
    activeTeam,
    players,
    matches,
    teamReportColumns.map((column) => column.key)
  );

  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.fullName]));
  const matchTable = buildMatchReportTable(
    matches,
    playerNames,
    defaultMatchReportFilters,
    matchReportColumns.map((column) => column.key)
  );

  const attendanceTable = buildAttendanceReportTable(
    players,
    sessions,
    matches,
    "seasonal",
    attendanceReportColumns.map((column) => column.key)
  );

  const reportsTable: ReportTable = {
    columns: [
      { key: "reportType", label: "Report Type" },
      { key: "format", label: "Format" },
      { key: "templateName", label: "Template" },
      { key: "createdAt", label: "Generated" },
    ],
    rows: historyEntries.map((entry) => ({
      reportType: entry.reportType,
      format: entry.format,
      templateName: entry.templateName ?? "—",
      createdAt: new Date(entry.createdAt).toLocaleString(),
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Data & Export" description="Export your team's data as PDF, Excel, or CSV." />

      <ExportCard
        dataType="players"
        label="Players"
        description={`${players.length} players in your squad.`}
        icon={Users}
        table={playerTable}
        onExport={(format) => addHistoryEntry("player", format)}
      />

      <ExportCard
        dataType="team"
        label="Team Information"
        description="Team identity, staff, and season record."
        icon={Shield}
        table={teamTable}
        onExport={(format) => addHistoryEntry("team", format)}
      />

      <ExportCard
        dataType="matches"
        label="Matches"
        description={`${matches.length} fixtures and results.`}
        icon={CalendarDays}
        table={matchTable}
        onExport={(format) => addHistoryEntry("match", format)}
      />

      <ExportCard
        dataType="attendance"
        label="Attendance"
        description="Full-season attendance ranking."
        icon={ClipboardCheck}
        table={attendanceTable}
        onExport={(format) => addHistoryEntry("attendance", format)}
      />

      {historyEntries.length > 0 ? (
        <ExportCard
          dataType="reports"
          label="Reports"
          description="Your generated report history."
          icon={FileBarChart}
          table={reportsTable}
        />
      ) : (
        <EmptyState
          icon={FileBarChart}
          title="No reports generated yet."
          description="Generate a report to see its export history here."
          actionLabel="Go to Reports"
          actionHref="/reports"
        />
      )}
    </div>
  );
}

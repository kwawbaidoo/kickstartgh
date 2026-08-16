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
import { useSeasonStore } from "@/store/season-store";
import {
  buildAttendanceReportTable,
  buildMatchReportTable,
  buildPlayerReportTable,
  buildTeamReportTable,
  defaultMatchReportFilters,
  defaultPlayerReportFilters,
  type ReportTable,
} from "@/lib/reports";
import { getSeasonRoster } from "@/lib/players";
import { getSeasonMatches, getSeasonSessions } from "@/lib/seasons";
import {
  matchReportColumns,
  playerReportColumns,
  teamReportColumns,
  attendanceReportColumns,
} from "@/config/reports";

export default function DataExportPage() {
  const activeSeason = useSeasonStore((state) =>
    state.seasons.find((season) => season.id === state.activeSeasonId)
  );
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const players = getSeasonRoster(usePlayersStore((state) => state.players), activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const sessions = getSeasonSessions(useAttendanceStore((state) => state.sessions), activeSeasonId);
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

  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.full_name]));
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
    attendanceReportColumns.map((column) => column.key)
  );

  const reportsTable: ReportTable = {
    columns: [
      { key: "report_type", label: "Report Type" },
      { key: "format", label: "Format" },
      { key: "template_name", label: "Template" },
      { key: "created_at", label: "Generated" },
    ],
    rows: historyEntries.map((entry) => ({
      report_type: entry.report_type,
      format: entry.format,
      template_name: entry.template_name ?? "—",
      created_at: new Date(entry.created_at).toLocaleString(),
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Data & Export" description="Export your team's data as PDF, Excel, or CSV." />
      {activeSeason && (
        <p className="-mt-3 text-xs text-muted-foreground">
          Exporting: <span className="font-medium text-foreground">{activeSeason.name}</span>
        </p>
      )}

      <ExportCard
        dataType="players"
        label="Players"
        description={`${players.length} players in your squad.`}
        icon={Users}
        table={playerTable}
        onExport={(format) => addHistoryEntry("player", format).catch(() => {})}
      />

      <ExportCard
        dataType="team"
        label="Team Information"
        description="Team identity, staff, and season record."
        icon={Shield}
        table={teamTable}
        onExport={(format) => addHistoryEntry("team", format).catch(() => {})}
      />

      <ExportCard
        dataType="matches"
        label="Matches"
        description={`${matches.length} fixtures and results.`}
        icon={CalendarDays}
        table={matchTable}
        onExport={(format) => addHistoryEntry("match", format).catch(() => {})}
      />

      <ExportCard
        dataType="attendance"
        label="Attendance"
        description="Full-season attendance ranking."
        icon={ClipboardCheck}
        table={attendanceTable}
        onExport={(format) => addHistoryEntry("attendance", format).catch(() => {})}
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

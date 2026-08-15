"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FilterPanel } from "@/components/reports/FilterPanel";
import { ColumnSelector } from "@/components/reports/ColumnSelector";
import { ReportWizard } from "@/components/reports/ReportWizard";
import { SavedTemplates } from "@/components/reports/SavedTemplates";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportType } from "@/config/reports";
import {
  playerReportColumns,
  playerReportDefaultColumns,
  teamReportColumns,
  teamReportDefaultColumns,
  matchReportColumns,
  matchReportDefaultColumns,
  attendanceReportColumns,
  attendanceReportDefaultColumns,
} from "@/config/reports";
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
} from "@/lib/reports";
import { getSeasonRoster } from "@/lib/players";
import {
  filterByDateRange,
  getReportDateRange,
  getSeasonMatches,
  getSeasonSessions,
  reportPeriodLabels,
  reportPeriodOptions,
  type ReportPeriod,
} from "@/lib/seasons";

const reportTypeTabs: { value: ReportType; label: string }[] = [
  { value: "player", label: "Player" },
  { value: "team", label: "Team" },
  { value: "match", label: "Match" },
  { value: "attendance", label: "Attendance" },
];

const columnsByType = {
  player: { all: playerReportColumns, defaults: playerReportDefaultColumns },
  team: { all: teamReportColumns, defaults: teamReportDefaultColumns },
  match: { all: matchReportColumns, defaults: matchReportDefaultColumns },
  attendance: { all: attendanceReportColumns, defaults: attendanceReportDefaultColumns },
};

export default function SeasonReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seasons = useSeasonStore((state) => state.seasons);
  const allPlayers = usePlayersStore((state) => state.players);
  const allMatches = useMatchesStore((state) => state.matches);
  const allSessions = useAttendanceStore((state) => state.sessions);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const addHistoryEntry = useReportsStore((state) => state.addHistoryEntry);

  const [report_type, setReportType] = useState<ReportType>("player");
  const [period, setPeriod] = useState<ReportPeriod>("fullSeason");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [columns, setColumns] = useState<string[]>(playerReportDefaultColumns);

  const season = seasons.find((candidate) => candidate.id === id);

  if (!season) {
    return (
      <EmptyState
        title="Season not found."
        description="This season may have been removed."
        actionLabel="Back to Seasons"
        actionHref="/seasons"
      />
    );
  }

  const seasonPlayers = getSeasonRoster(allPlayers, id);
  const seasonMatches = getSeasonMatches(allMatches, id);
  const seasonSessions = getSeasonSessions(allSessions, id);

  const dateRange = getReportDateRange(
    season,
    period,
    period === "custom" && customRange.start && customRange.end ? customRange : undefined
  );
  const periodMatches = filterByDateRange(seasonMatches, dateRange);
  const periodSessions = filterByDateRange(seasonSessions, dateRange);

  function handleTypeChange(next: ReportType) {
    setReportType(next);
    setColumns(columnsByType[next].defaults);
  }

  const playerNames = Object.fromEntries(seasonPlayers.map((player) => [player.id, player.full_name]));

  const table =
    report_type === "player"
      ? buildPlayerReportTable(seasonPlayers, periodMatches, periodSessions, defaultPlayerReportFilters, columns)
      : report_type === "team"
        ? buildTeamReportTable(activeTeam, seasonPlayers, periodMatches, columns)
        : report_type === "match"
          ? buildMatchReportTable(periodMatches, playerNames, defaultMatchReportFilters, columns)
          : buildAttendanceReportTable(seasonPlayers, seasonSessions, seasonMatches, "seasonal", columns);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={`/seasons/${id}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {season.name}
      </Link>

      <SectionHeader title={`${season.name} — Reports`} description="Build a report for this season." />

      <Tabs value={report_type} onValueChange={(value) => handleTypeChange(value as ReportType)}>
        <TabsList>
          {reportTypeTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ReportWizard
        filename={`${season.name.toLowerCase().replace(/\s+/g, "-")}-${report_type}-report`}
        title={`${teamName} — ${reportTypeTabs.find((tab) => tab.value === report_type)?.label} Report`}
        table={table}
        onExport={(format) => addHistoryEntry(report_type, format)}
        filtersSlot={
          <FilterPanel>
            {report_type === "attendance" ? (
              <p className="text-sm text-muted-foreground">
                Attendance reports always cover the full season, so every session counts.
              </p>
            ) : (
              <>
                <Select
                  items={Object.fromEntries(reportPeriodOptions.map((option) => [option, reportPeriodLabels[option]]))}
                  value={period}
                  onValueChange={(value) => setPeriod((value ?? "fullSeason") as ReportPeriod)}
                >
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportPeriodOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {reportPeriodLabels[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {period === "custom" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      type="date"
                      value={customRange.start}
                      onChange={(event) => setCustomRange({ ...customRange, start: event.target.value })}
                    />
                    <Input
                      type="date"
                      value={customRange.end}
                      onChange={(event) => setCustomRange({ ...customRange, end: event.target.value })}
                    />
                  </div>
                )}
              </>
            )}
          </FilterPanel>
        }
        columnsSlot={
          <ColumnSelector
            allColumns={columnsByType[report_type].all}
            selected={columns}
            onChange={setColumns}
          />
        }
      />

      <SavedTemplates report_type={report_type} currentColumns={columns} onApply={(template) => setColumns(template.columns)} />
    </div>
  );
}

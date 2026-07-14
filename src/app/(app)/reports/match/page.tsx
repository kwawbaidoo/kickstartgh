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
import { matchReportColumns, matchReportDefaultColumns } from "@/config/reports";
import { useInitialReportColumns } from "@/hooks/useInitialReportColumns";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useReportsStore } from "@/store/reports-store";
import {
  buildMatchReportTable,
  defaultMatchReportFilters,
  getMatchCompetitions,
  type MatchReportFilters,
} from "@/lib/reports";

const statusItems = { All: "All statuses", upcoming: "Upcoming", completed: "Completed", cancelled: "Cancelled" };

export default function MatchReportPage() {
  const matches = useMatchesStore((state) => state.matches);
  const players = usePlayersStore((state) => state.players);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const addHistoryEntry = useReportsStore((state) => state.addHistoryEntry);

  const [filters, setFilters] = useState<MatchReportFilters>(defaultMatchReportFilters);
  const [columns, setColumns] = useState<string[]>(
    useInitialReportColumns("match", matchReportDefaultColumns)
  );

  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.fullName]));
  const competitions = getMatchCompetitions(matches);
  const table = buildMatchReportTable(matches, playerNames, filters, columns);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Match Report" description="Fixtures, results, and match events." />

      <ReportWizard
        filename="match-report"
        title={`${teamName} — Match Report`}
        table={table}
        onExport={(format) => addHistoryEntry("match", format)}
        filtersSlot={
          <FilterPanel>
            <Select
              items={statusItems}
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: (value ?? "All") as typeof filters.status })
              }
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              items={{ All: "All competitions", ...Object.fromEntries(competitions.map((c) => [c, c])) }}
              value={filters.competition}
              onValueChange={(value) => setFilters({ ...filters, competition: value ?? "All" })}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All competitions</SelectItem>
                {competitions.map((competition) => (
                  <SelectItem key={competition} value={competition}>
                    {competition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterPanel>
        }
        columnsSlot={
          <ColumnSelector allColumns={matchReportColumns} selected={columns} onChange={setColumns} />
        }
      />

      <SavedTemplates
        reportType="match"
        currentColumns={columns}
        onApply={(template) => setColumns(template.columns)}
      />
    </div>
  );
}

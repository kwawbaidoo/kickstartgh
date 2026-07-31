"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { FilterPanel } from "@/components/reports/FilterPanel";
import { ColumnSelector } from "@/components/reports/ColumnSelector";
import { ReportWizard } from "@/components/reports/ReportWizard";
import { SavedTemplates } from "@/components/reports/SavedTemplates";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ageGroupOptions, positionOptions, statusOptions } from "@/config/players";
import { playerReportColumns, playerReportDefaultColumns, playerReportPresets } from "@/config/reports";
import { useInitialReportColumns } from "@/hooks/useInitialReportColumns";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useReportsStore } from "@/store/reports-store";
import { useSeasonStore } from "@/store/season-store";
import {
  buildPlayerReportShareMessage,
  buildPlayerReportTable,
  defaultPlayerReportFilters,
  type PlayerReportFilters,
} from "@/lib/reports";
import { getSeasonRoster } from "@/lib/players";
import { getSeasonMatches, getSeasonSessions } from "@/lib/seasons";

export default function PlayerReportPage() {
  const activeSeason = useSeasonStore((state) =>
    state.seasons.find((season) => season.id === state.activeSeasonId)
  );
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const players = getSeasonRoster(usePlayersStore((state) => state.players), activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const sessions = getSeasonSessions(useAttendanceStore((state) => state.sessions), activeSeasonId);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const addHistoryEntry = useReportsStore((state) => state.addHistoryEntry);

  const [filters, setFilters] = useState<PlayerReportFilters>(defaultPlayerReportFilters);
  const [columns, setColumns] = useState<string[]>(
    useInitialReportColumns("player", playerReportDefaultColumns)
  );

  const table = buildPlayerReportTable(players, matches, sessions, filters, columns);
  const filteredPlayers = players.filter((player) => {
    if (filters.position !== "All" && player.position !== filters.position) return false;
    if (filters.status !== "All" && player.status !== filters.status) return false;
    return true;
  });

  const shareMessage =
    filteredPlayers.length === 1 ? buildPlayerReportShareMessage(filteredPlayers[0], matches) : null;

  return (
    <>
      <SectionHeader title="Player Report" description="Build a custom report of your squad." />
      {activeSeason && (
        <p className="text-xs text-muted-foreground">
          Reporting on: <span className="font-medium text-foreground">{activeSeason.name}</span>
        </p>
      )}

      <ReportWizard
        filename="player-report"
        title={`${teamName} — Player Report`}
        table={table}
        onExport={(format) => addHistoryEntry("player", format)}
        filtersSlot={
          <FilterPanel>
            <Select
              items={{ All: "All positions", ...Object.fromEntries(positionOptions.map((p) => [p, p])) }}
              value={filters.position}
              onValueChange={(value) => setFilters({ ...filters, position: (value ?? "All") as typeof filters.position })}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All positions</SelectItem>
                {positionOptions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              items={{ All: "All ages", ...Object.fromEntries(ageGroupOptions.map((a) => [a, a])) }}
              value={filters.ageGroup}
              onValueChange={(value) => setFilters({ ...filters, ageGroup: (value ?? "All") as typeof filters.ageGroup })}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All ages</SelectItem>
                {ageGroupOptions.map((ageGroup) => (
                  <SelectItem key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              items={{ All: "All statuses", ...Object.fromEntries(statusOptions.map((s) => [s, s])) }}
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: (value ?? "All") as typeof filters.status })}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterPanel>
        }
        columnsSlot={
          <ColumnSelector
            allColumns={playerReportColumns}
            selected={columns}
            onChange={setColumns}
            presets={playerReportPresets}
          />
        }
        shareSlot={
          shareMessage ? (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <MessageCircle />
              Share Player Summary
            </a>
          ) : undefined
        }
      />

      <SavedTemplates
        reportType="player"
        currentColumns={columns}
        onApply={(template) => setColumns(template.columns)}
      />
    </>
  );
}

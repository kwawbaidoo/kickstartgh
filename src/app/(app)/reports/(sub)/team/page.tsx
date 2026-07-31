"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { FilterPanel } from "@/components/reports/FilterPanel";
import { ColumnSelector } from "@/components/reports/ColumnSelector";
import { ReportWizard } from "@/components/reports/ReportWizard";
import { SavedTemplates } from "@/components/reports/SavedTemplates";
import { buttonVariants } from "@/components/ui/button";
import { teamReportColumns, teamReportDefaultColumns } from "@/config/reports";
import { useInitialReportColumns } from "@/hooks/useInitialReportColumns";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useReportsStore } from "@/store/reports-store";
import { useSeasonStore } from "@/store/season-store";
import { buildTeamReportShareMessage, buildTeamReportTable } from "@/lib/reports";
import { getSeasonRoster } from "@/lib/players";
import { getSeasonMatches } from "@/lib/seasons";

export default function TeamReportPage() {
  const activeSeason = useSeasonStore((state) =>
    state.seasons.find((season) => season.id === state.activeSeasonId)
  );
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const players = getSeasonRoster(usePlayersStore((state) => state.players), activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const addHistoryEntry = useReportsStore((state) => state.addHistoryEntry);

  const [columns, setColumns] = useState<string[]>(
    useInitialReportColumns("team", teamReportDefaultColumns)
  );

  const table = buildTeamReportTable(activeTeam, players, matches, columns);
  const shareMessage = buildTeamReportShareMessage(activeTeam, matches);

  return (
    <>
      <SectionHeader title="Team Report" description="A full profile and record for your team." />
      {activeSeason && (
        <p className="text-xs text-muted-foreground">
          Reporting on: <span className="font-medium text-foreground">{activeSeason.name}</span>
        </p>
      )}

      <ReportWizard
        filename="team-report"
        title={`${activeTeam.name} — Team Report`}
        table={table}
        onExport={(format) => addHistoryEntry("team", format)}
        filtersSlot={
          <FilterPanel>
            <p className="text-sm text-muted-foreground">
              Team reports summarize your whole team — pick which details to include on the next step.
            </p>
          </FilterPanel>
        }
        columnsSlot={
          <ColumnSelector allColumns={teamReportColumns} selected={columns} onChange={setColumns} />
        }
        shareSlot={
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <MessageCircle />
            Share Team Summary
          </a>
        }
      />

      <SavedTemplates
        reportType="team"
        currentColumns={columns}
        onApply={(template) => setColumns(template.columns)}
      />
    </>
  );
}

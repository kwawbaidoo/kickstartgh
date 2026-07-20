"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SeasonSettings } from "@/components/seasons/SeasonSettings";
import { seasonStatusLabels } from "@/config/seasons";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonRecord, getSeasonRoster } from "@/lib/players";
import { getSeasonStats } from "@/lib/seasons";
import type { ReportTable } from "@/lib/reports";

export default function SeasonSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const seasons = useSeasonStore((state) => state.seasons);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const renameSeason = useSeasonStore((state) => state.renameSeason);
  const activateSeason = useSeasonStore((state) => state.activateSeason);
  const archiveSeason = useSeasonStore((state) => state.archiveSeason);
  const duplicateSeason = useSeasonStore((state) => state.duplicateSeason);
  const allPlayers = usePlayersStore((state) => state.players);
  const bulkRegisterForSeason = usePlayersStore((state) => state.bulkRegisterForSeason);
  const allMatches = useMatchesStore((state) => state.matches);
  const allSessions = useAttendanceStore((state) => state.sessions);

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

  const isActive = season.id === activeSeasonId;
  const stats = getSeasonStats(season, allPlayers, allMatches, allSessions);

  const exportTable: ReportTable = {
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
    ],
    rows: [
      { metric: "Season", value: season.name },
      { metric: "Status", value: seasonStatusLabels[season.status] },
      { metric: "Start Date", value: format(new Date(season.startDate), "d MMM yyyy") },
      { metric: "End Date", value: format(new Date(season.endDate), "d MMM yyyy") },
      { metric: "Registered Players", value: String(stats.registeredPlayers) },
      { metric: "Matches Played", value: String(stats.played) },
      { metric: "Wins", value: String(stats.wins) },
      { metric: "Draws", value: String(stats.draws) },
      { metric: "Losses", value: String(stats.losses) },
      { metric: "Win Rate", value: `${stats.winPercentage}%` },
      { metric: "Goals For", value: String(stats.goalsFor) },
      { metric: "Goals Against", value: String(stats.goalsAgainst) },
      { metric: "Training Sessions", value: String(stats.trainingSessions) },
      { metric: "Attendance", value: `${stats.attendancePercentage}%` },
    ],
  };

  function handleDuplicate(name: string, carryForwardRoster: boolean) {
    const duplicate = duplicateSeason(id, name);
    if (!duplicate) return;
    if (carryForwardRoster) {
      const activeRoster = getSeasonRoster(allPlayers, id).filter(
        (player) => getSeasonRecord(player, id)?.status === "Active"
      );
      bulkRegisterForSeason(duplicate.id, activeRoster.map((player) => player.id), id);
    }
    router.push(`/seasons/${duplicate.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={`/seasons/${id}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {season.name}
      </Link>

      <SectionHeader title="Season Settings" description="Rename, activate, archive, duplicate, or export." />

      <SeasonSettings
        season={season}
        isActive={isActive}
        exportTable={exportTable}
        onRename={(name) => renameSeason(id, name)}
        onActivate={() => activateSeason(id)}
        onArchive={() => archiveSeason(id)}
        onDuplicate={handleDuplicate}
      />
    </div>
  );
}

"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { TrainingCard } from "@/components/training/TrainingCard";
import { TrainingsTable } from "@/components/training/TrainingsTable";
import { ViewToggle, type CardListView } from "@/components/common/ViewToggle";
import { buttonVariants } from "@/components/ui/button";
import { useAttendanceStore } from "@/store/attendance-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonSessions } from "@/lib/seasons";
import { defaultTrainingFilters, filterTrainingSessions } from "@/lib/training";

const PAGE_SIZE = 16;

export default function SeasonTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seasons = useSeasonStore((state) => state.seasons);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const sessions = getSeasonSessions(useAttendanceStore((state) => state.sessions), id);
  const [view, setView] = useState<CardListView>("card");
  const [filters, setFilters] = useState(defaultTrainingFilters);
  const [page, setPage] = useState(1);

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
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const filtered = filterTrainingSessions(sorted, filters);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const paginatedSessions = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/seasons/${id}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {season.name}
      </Link>

      <SectionHeader
        title={`${season.name} — Training`}
        description="Training sessions scheduled for this season."
        action={
          isActive ? (
            <Link href="/training/new" className={buttonVariants({ size: "sm" })}>
              Schedule Training
            </Link>
          ) : undefined
        }
      />

      {!isActive && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          This season isn&apos;t active, so its sessions are read-only.
        </p>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={filters.search}
            onChange={(search) => {
              setFilters({ ...filters, search });
              setPage(1);
            }}
            placeholder="Search by title, venue, or focus"
          />
          <ViewToggle
            value={view}
            onChange={(next) => {
              setView(next);
              setPage(1);
            }}
          />
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          title="No training sessions yet."
          description="Sessions scheduled for this season will show up here."
          actionLabel={isActive ? "Schedule Training" : undefined}
          actionHref={isActive ? "/training/new" : undefined}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No sessions match your search."
          description="Try a different title, venue, or focus."
        />
      ) : (
        <>
          {view === "card" ? (
            <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {paginatedSessions.map((session) => (
                <TrainingCard key={session.id} session={session} />
              ))}
            </Stagger>
          ) : (
            <TrainingsTable sessions={paginatedSessions} />
          )}
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

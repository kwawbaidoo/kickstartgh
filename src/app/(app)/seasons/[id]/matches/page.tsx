"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldOff } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchesTable } from "@/components/matches/MatchesTable";
import { ViewToggle, type CardListView } from "@/components/common/ViewToggle";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatchesStore } from "@/store/matches-store";
import { useSeasonStore } from "@/store/season-store";
import { defaultMatchFilters, filterMatches, getCompetitions } from "@/lib/matches";
import { getSeasonMatches } from "@/lib/seasons";
import type { MatchStatus } from "@/mock/matches";
import { toSelectItems } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusTabs: { value: MatchStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 16;

export default function SeasonMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seasons = useSeasonStore((state) => state.seasons);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), id);
  const [status, setStatus] = useState<MatchStatus>("upcoming");
  const [view, setView] = useState<CardListView>("card");
  const [filters, setFilters] = useState(defaultMatchFilters);
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
  const competitions = getCompetitions(matches);
  const competitionItems = { All: "All competitions", ...toSelectItems(competitions) };
  const filtered = filterMatches(matches, status, filters);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const paginatedMatches = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        title={`${season.name} — Matches`}
        description="Fixtures and results for this season."
        action={
          isActive ? (
            <Link href="/matches/new" className={buttonVariants({ size: "sm" })}>
              Create Match
            </Link>
          ) : undefined
        }
      />

      {!isActive && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          This season isn&apos;t active, so its fixtures are read-only.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          value={status}
          onValueChange={(value) => {
            setStatus(value as MatchStatus);
            setPage(1);
          }}
        >
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ViewToggle
          value={view}
          onChange={(next) => {
            setView(next);
            setPage(1);
          }}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBar
          value={filters.search}
          onChange={(search) => {
            setFilters({ ...filters, search });
            setPage(1);
          }}
          placeholder="Search by opponent or competition"
        />
        <Select
          items={competitionItems}
          value={filters.competition}
          onValueChange={(value) => {
            setFilters({ ...filters, competition: value ?? "All" });
            setPage(1);
          }}
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldOff}
          title="No matches here yet."
          description="Matches for this season will show up here."
          actionLabel={isActive ? "Create Match" : undefined}
          actionHref={isActive ? "/matches/new" : undefined}
        />
      ) : (
        <>
          {view === "card" ? (
            <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {paginatedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </Stagger>
          ) : (
            <MatchesTable matches={paginatedMatches} />
          )}
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

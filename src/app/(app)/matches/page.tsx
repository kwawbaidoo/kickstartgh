"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, ShieldOff } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Stagger } from "@/components/common/Stagger";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { ListRowSkeleton } from "@/components/common/LoadingSkeleton";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchesTable } from "@/components/matches/MatchesTable";
import { ViewToggle, type CardListView } from "@/components/common/ViewToggle";
import { SeasonPerformanceCard } from "@/components/matches/SeasonPerformanceCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMatchesStore } from "@/store/matches-store";
import { useSeasonStore } from "@/store/season-store";
import { defaultMatchFilters, filterMatches, getCompetitions, getSeasonPerformance } from "@/lib/matches";
import { getSeasonMatches } from "@/lib/seasons";
import type { MatchStatus } from "@/mock/matches";
import { toSelectItems } from "@/lib/utils";

const statusTabs: { value: MatchStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const emptyCopy: Record<MatchStatus, { title: string; description: string }> = {
  upcoming: {
    title: "No matches scheduled yet.",
    description: "Create your first fixture to start tracking results.",
  },
  completed: {
    title: "No completed matches yet.",
    description: "Results will show up here once fixtures are finished.",
  },
  cancelled: {
    title: "No cancelled matches.",
    description: "Cancelled fixtures will show up here.",
  },
};

const homeAwayItems = { All: "All venues", Home: "Home", Away: "Away" };

const PAGE_SIZE = 16;

export default function MatchesPage() {
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const activeSeason = useSeasonStore((state) =>
    state.seasons.find((season) => season.id === state.activeSeasonId)
  );
  const matches = getSeasonMatches(useMatchesStore((state) => state.matches), activeSeasonId);
  const hasHydrated = useMatchesStore((state) => state.hasHydrated);
  const isLoading = useMatchesStore((state) => state.isLoading);
  const [status, setStatus] = useState<MatchStatus>("upcoming");
  const [view, setView] = useState<CardListView>("card");
  const [filters, setFilters] = useState(defaultMatchFilters);
  const [page, setPage] = useState(1);

  const competitions = getCompetitions(matches);
  const competitionItems = { All: "All competitions", ...toSelectItems(competitions) };
  const seasonPerformance = getSeasonPerformance(matches);

  const filtered = filterMatches(matches, status, filters);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const paginatedMatches = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!hasHydrated || isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <ListRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Matches"
        description="Fixtures, results, and match events."
        action={
          <Link href="/matches/new" className={buttonVariants({ size: "sm" })}>
            <CalendarPlus />
            Create Match
          </Link>
        }
      />

      <SeasonPerformanceCard performance={seasonPerformance} seasonName={activeSeason?.name} />

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
        <Select
          items={homeAwayItems}
          value={filters.homeAway}
          onValueChange={(value) => {
            setFilters({ ...filters, homeAway: value as typeof filters.homeAway });
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All venues</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Away">Away</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldOff}
          title={emptyCopy[status].title}
          description={emptyCopy[status].description}
          actionLabel={status === "upcoming" ? "Create Match" : undefined}
          actionHref={status === "upcoming" ? "/matches/new" : undefined}
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

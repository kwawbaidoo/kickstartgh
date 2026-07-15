"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  UserCheck,
  Users,
} from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { Stagger } from "@/components/common/Stagger";
import { SearchBar } from "@/components/common/SearchBar";
import { ListRowSkeleton } from "@/components/common/LoadingSkeleton";
import { ViewToggle, type CardListView } from "@/components/common/ViewToggle";
import { Pagination } from "@/components/common/Pagination";
import { PlayerCard } from "@/components/players/PlayerCard";
import { PlayersTable } from "@/components/players/PlayersTable";
import { PlayerFilter } from "@/components/players/PlayerFilter";
import { EmptyPlayerState } from "@/components/players/EmptyPlayerState";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { positionOptions } from "@/config/players";
import { usePlayersStore } from "@/store/players-store";
import {
  defaultPlayerFilters,
  filterPlayers,
  sortPlayers,
  type PlayerSort,
} from "@/lib/players";
import { getInitials } from "@/lib/utils";

const sortItems: Record<PlayerSort, string> = {
  name: "Name (A–Z)",
  jerseyNumber: "Jersey number",
  recent: "Recently added",
};

const PAGE_SIZE = 10;

export default function PlayersPage() {
  const players = usePlayersStore((state) => state.players);
  const hasHydrated = usePlayersStore((state) => state.hasHydrated);
  const [filters, setFilters] = useState(defaultPlayerFilters);
  const [sort, setSort] = useState<PlayerSort>("name");
  const [view, setView] = useState<CardListView>("card");
  const [page, setPage] = useState(1);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const filteredPlayers = useMemo(
    () => sortPlayers(filterPlayers(players, filters), sort),
    [players, filters, sort]
  );

  const pageCount = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleFiltersChange(next: typeof filters) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(next: PlayerSort) {
    setSort(next);
    setPage(1);
  }

  const activeCount = players.filter((player) => player.status === "Active").length;

  const recentPlayers = useMemo(
    () =>
      [...players]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [players]
  );

  const hasActiveFilters =
    filters.search !== "" ||
    filters.position !== "All" ||
    filters.ageGroup !== "All" ||
    filters.status !== "All";

  function handleExport(format: "PDF" | "Excel") {
    setExportMessage(`Preparing ${format} export...`);
    setTimeout(() => {
      setExportMessage(`Mock: your ${format} file would download here.`);
    }, 700);
  }

  if (!hasHydrated) {
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
        title="Players"
        description="View and manage your squad."
        action={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                <Download />
                Export
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("PDF")}>
                  <FileText />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("Excel")}>
                  <FileSpreadsheet />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/players/new" className={buttonVariants({ size: "sm" })}>
              <Plus />
              Add Player
            </Link>
          </div>
        }
      />

      {exportMessage && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {exportMessage}
        </p>
      )}

      {players.length === 0 ? (
        <EmptyPlayerState variant="no-players" />
      ) : (
        <>
          <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatisticCard title="Total Players" value={players.length} icon={<Users />} />
            <StatisticCard title="Active" value={activeCount} icon={<UserCheck />} />
            {positionOptions.map((position) => (
              <StatisticCard
                key={position}
                title={position}
                value={players.filter((player) => player.position === position).length}
                icon={<Users />}
                className="hidden lg:flex"
              />
            ))}
          </Stagger>

          {recentPlayers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Recently added</span>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {recentPlayers.map((player) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-card py-1.5 pr-3 pl-1.5 ring-1 ring-foreground/10"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {getInitials(player.fullName)}
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap text-foreground">
                      {player.fullName}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchBar
              value={filters.search}
              onChange={(search) => handleFiltersChange({ ...filters, search })}
              placeholder="Search by name, nickname, or jersey number"
            />
            <PlayerFilter filters={filters} onChange={handleFiltersChange} />
            <Select items={sortItems} value={sort} onValueChange={(value) => handleSortChange(value as PlayerSort)}>
              <SelectTrigger className="w-full sm:w-auto">
                <ArrowUpDown className="size-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="jerseyNumber">Jersey number</SelectItem>
                <SelectItem value="recent">Recently added</SelectItem>
              </SelectContent>
            </Select>
            <ViewToggle
              value={view}
              onChange={(next) => {
                setView(next);
                setPage(1);
              }}
            />
          </div>

          {filteredPlayers.length === 0 ? (
            <EmptyPlayerState
              variant="no-results"
              onClearFilters={
                hasActiveFilters
                  ? () => {
                      setFilters(defaultPlayerFilters);
                      setPage(1);
                    }
                  : undefined
              }
            />
          ) : (
            <>
              {view === "card" ? (
                <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {paginatedPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </Stagger>
              ) : (
                <PlayersTable players={paginatedPlayers} />
              )}
              <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}

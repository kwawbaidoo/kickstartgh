"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpDown, Plus, UserPlus, X } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Modal } from "@/components/common/Modal";
import { SearchBar } from "@/components/common/SearchBar";
import { Stagger } from "@/components/common/Stagger";
import { Pagination } from "@/components/common/Pagination";
import { ViewToggle, type CardListView } from "@/components/common/ViewToggle";
import { SeasonPlayerCard } from "@/components/seasons/SeasonPlayerCard";
import { SeasonPlayerStatsTable } from "@/components/seasons/SeasonPlayerStatsTable";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusBadgeClasses } from "@/config/players";
import { seasonStatusLabels } from "@/config/seasons";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useSeasonStore } from "@/store/season-store";
import { getSeasonRecord, getSeasonRoster, isRegisteredInSeason } from "@/lib/players";
import {
  getSeasonPlayerStats,
  sortSeasonPlayerStats,
  type SeasonPlayerStatsSort,
} from "@/lib/seasons";
import { cn, getInitials } from "@/lib/utils";

const PAGE_SIZE = 16;

const statsSortItems: Record<SeasonPlayerStatsSort, string> = {
  jersey_number: "Jersey number",
  name: "Name (A–Z)",
  goals: "Most goals",
  assists: "Most assists",
  yellowCards: "Most yellow cards",
  redCards: "Most red cards",
  attendance: "Attendance %",
};

type RosterTab = "players" | "stats";

export default function SeasonPlayersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seasons = useSeasonStore((state) => state.seasons);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const allPlayers = usePlayersStore((state) => state.players);
  const allMatches = useMatchesStore((state) => state.matches);
  const allSessions = useAttendanceStore((state) => state.sessions);
  const registerPlayerForSeason = usePlayersStore((state) => state.registerPlayerForSeason);
  const bulkRegisterForSeason = usePlayersStore((state) => state.bulkRegisterForSeason);
  const removePlayerFromSeason = usePlayersStore((state) => state.removePlayerFromSeason);
  const fetchSeasonRoster = usePlayersStore((state) => state.fetchSeasonRoster);

  const [tab, setTab] = useState<RosterTab>("players");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [jersey_number, setJerseyNumber] = useState("");
  const [carryOpen, setCarryOpen] = useState(false);
  const [sourceSeasonId, setSourceSeasonId] = useState<string | null>(null);
  const [view, setView] = useState<CardListView>("card");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statsSearch, setStatsSearch] = useState("");
  const [statsSort, setStatsSort] = useState<SeasonPlayerStatsSort>("jersey_number");
  const [statsPage, setStatsPage] = useState(1);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [carryError, setCarryError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeasonRoster(id).catch(() => {});
  }, [id, fetchSeasonRoster]);

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
  const roster = getSeasonRoster(allPlayers, id);
  const unregisteredPlayers = allPlayers.filter((player) => !isRegisteredInSeason(player, id));
  const otherSeasons = seasons.filter((candidate) => candidate.id !== id);

  const query = search.trim().toLowerCase();
  const filteredRoster = query
    ? roster.filter((player) => {
        const record = getSeasonRecord(player, id);
        return (
          player.full_name.toLowerCase().includes(query) ||
          String(record?.jersey_number ?? "").includes(query)
        );
      })
    : roster;

  const pageCount = Math.max(1, Math.ceil(filteredRoster.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const paginatedRoster = filteredRoster.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const seasonStats = getSeasonPlayerStats(allPlayers, allMatches, allSessions, id);
  const statsQuery = statsSearch.trim().toLowerCase();
  const filteredStats = statsQuery
    ? seasonStats.filter(
        (entry) =>
          entry.player.full_name.toLowerCase().includes(statsQuery) ||
          String(entry.jersey_number).includes(statsQuery)
      )
    : seasonStats;
  const sortedStats = sortSeasonPlayerStats(filteredStats, statsSort);
  const statsPageCount = Math.max(1, Math.ceil(sortedStats.length / PAGE_SIZE));
  const currentStatsPage = Math.min(Math.max(statsPage, 1), statsPageCount);
  const paginatedStats = sortedStats.slice(
    (currentStatsPage - 1) * PAGE_SIZE,
    currentStatsPage * PAGE_SIZE
  );

  async function handleRegister() {
    if (!selectedPlayerId || !jersey_number) return;
    setRegisterError(null);
    try {
      await registerPlayerForSeason(selectedPlayerId, id, Number(jersey_number));
      setSelectedPlayerId(null);
      setJerseyNumber("");
      setPickerOpen(false);
    } catch {
      setRegisterError("Couldn't register this player. Please try again.");
    }
  }

  async function handleCarryForward() {
    if (!sourceSeasonId) return;
    setCarryError(null);
    const sourceRoster = getSeasonRoster(allPlayers, sourceSeasonId).filter(
      (player) => getSeasonRecord(player, sourceSeasonId)?.status === "Active"
    );
    try {
      await bulkRegisterForSeason(
        id,
        sourceRoster.map((player) => player.id),
        sourceSeasonId
      );
      setCarryOpen(false);
      setSourceSeasonId(null);
    } catch {
      setCarryError("Couldn't carry forward this roster. Please try again.");
    }
  }

  function handleRemove(player_id: string) {
    setRemoveError(null);
    removePlayerFromSeason(player_id, id).catch(() =>
      setRemoveError("Couldn't remove this player from the season. Please try again.")
    );
  }

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
        title="Season Roster"
        description={`Players registered for ${season.name}.`}
        action={
          tab === "players" && isActive ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCarryOpen(true)}>
                Carry Forward
              </Button>
              <Button size="sm" onClick={() => setPickerOpen(true)}>
                <Plus />
                Register Player
              </Button>
            </div>
          ) : undefined
        }
      />

      {!isActive && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {season.name} is {seasonStatusLabels[season.status].toLowerCase()} — this roster is read-only.
        </p>
      )}

      {roster.length === 0 ? (
        <EmptyState
          title="No players registered yet."
          description="Register players from your squad to build this season's roster."
          actionLabel={isActive ? "Register Player" : undefined}
          onAction={isActive ? () => setPickerOpen(true) : undefined}
        />
      ) : (
        <Tabs value={tab} onValueChange={(next) => setTab(next as RosterTab)}>
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="stats">Performance & Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="flex flex-col gap-4 pt-4">
            {removeError && (
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{removeError}</p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchBar
                value={search}
                onChange={(next) => {
                  setSearch(next);
                  setPage(1);
                }}
                placeholder="Search by name or jersey number"
              />
              <ViewToggle
                value={view}
                onChange={(next) => {
                  setView(next);
                  setPage(1);
                }}
              />
            </div>

            {filteredRoster.length === 0 ? (
              <EmptyState
                title="No players match your search."
                description="Try a different name or jersey number."
              />
            ) : (
              <>
                {view === "card" ? (
                  <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {paginatedRoster.map((player) => {
                      const record = getSeasonRecord(player, id);
                      if (!record) return null;
                      return (
                        <SeasonPlayerCard
                          key={player.id}
                          player={player}
                          jersey_number={record.jersey_number}
                          status={record.status}
                          onRemove={isActive ? () => handleRemove(player.id) : undefined}
                        />
                      );
                    })}
                  </Stagger>
                ) : (
                  <div className="flex flex-col gap-2">
                    {paginatedRoster.map((player) => {
                      const record = getSeasonRecord(player, id);
                      if (!record) return null;
                      return (
                        <div
                          key={player.id}
                          className="flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-foreground/10"
                        >
                          <Link
                            href={`/players/${player.id}`}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              {player.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={player.photo} alt="" className="size-full object-cover" />
                              ) : (
                                getInitials(player.full_name)
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium text-foreground">
                                {player.full_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {player.position} · #{record.jersey_number}
                              </span>
                            </div>
                          </Link>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              statusBadgeClasses[record.status]
                            )}
                          >
                            {record.status}
                          </span>
                          {isActive && (
                            <button
                              type="button"
                              onClick={() => handleRemove(player.id)}
                              aria-label={`Remove ${player.full_name} from season`}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
              </>
            )}
          </TabsContent>

          <TabsContent value="stats" className="flex flex-col gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Matches played, goals, assists, cards, and attendance — all derived from this
              season&apos;s recorded match events and attendance, not entered separately.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchBar
                value={statsSearch}
                onChange={(next) => {
                  setStatsSearch(next);
                  setStatsPage(1);
                }}
                placeholder="Search by name or jersey number"
              />
              <Select
                items={statsSortItems}
                value={statsSort}
                onValueChange={(value) => {
                  setStatsSort((value as SeasonPlayerStatsSort) ?? "jersey_number");
                  setStatsPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-auto" aria-label="Sort stats">
                  <ArrowUpDown className="size-4" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statsSortItems).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sortedStats.length === 0 ? (
              <EmptyState
                title="No players match your search."
                description="Try a different name or jersey number."
              />
            ) : (
              <>
                <SeasonPlayerStatsTable stats={paginatedStats} />
                <Pagination
                  page={currentStatsPage}
                  pageCount={statsPageCount}
                  onPageChange={setStatsPage}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>Register a Player</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {unregisteredPlayers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Every player in your squad is already registered for this season.
                </p>
                <Link href="/players/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <UserPlus />
                  Add a New Player
                </Link>
              </div>
            ) : (
              <>
                <Select
                  items={Object.fromEntries(
                    unregisteredPlayers.map((player) => [player.id, player.full_name])
                  )}
                  value={selectedPlayerId}
                  onValueChange={setSelectedPlayerId}
                >
                  <SelectTrigger className="w-full" aria-label="Select a player">
                    <SelectValue placeholder="Select a player" />
                  </SelectTrigger>
                  <SelectContent>
                    {unregisteredPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Jersey number for this season"
                  value={jersey_number}
                  onChange={(event) => setJerseyNumber(event.target.value)}
                />
                {registerError && <p className="text-sm text-destructive">{registerError}</p>}
                <Button
                  className="w-full"
                  disabled={!selectedPlayerId || !jersey_number}
                  onClick={handleRegister}
                >
                  Register Player
                </Button>
                <Link
                  href="/players/new"
                  className="text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Or add a brand-new player
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Modal
        open={carryOpen}
        onOpenChange={setCarryOpen}
        title="Carry forward a roster"
        description="Bring every actively-registered player from a previous season into this one, keeping their jersey numbers."
        footer={
          <>
            <Button variant="outline" onClick={() => setCarryOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!sourceSeasonId} onClick={handleCarryForward}>
              Carry Forward
            </Button>
          </>
        }
      >
        {carryError && <p className="pb-2 text-sm text-destructive">{carryError}</p>}
        {otherSeasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other seasons exist yet.</p>
        ) : (
          <Select
            items={Object.fromEntries(otherSeasons.map((candidate) => [candidate.id, candidate.name]))}
            value={sourceSeasonId}
            onValueChange={setSourceSeasonId}
          >
            <SelectTrigger className="w-full" aria-label="Select a season to carry forward from">
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              {otherSeasons.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Modal>
    </div>
  );
}

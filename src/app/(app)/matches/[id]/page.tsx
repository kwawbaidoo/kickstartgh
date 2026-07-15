"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  Goal,
  ListChecks,
  MapPin,
  MessageCircle,
  Pencil,
  RotateCcw,
  Square,
  Trash2,
  Trophy,
  UserCheck,
  Zap,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ScoreBoard } from "@/components/matches/ScoreBoard";
import { MatchTimeline } from "@/components/matches/MatchTimeline";
import { LineupView } from "@/components/matches/LineupView";
import { StatisticWidget } from "@/components/matches/StatisticWidget";
import { Modal } from "@/components/common/Modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import {
  buildFixtureShareMessage,
  buildLineupShareMessage,
  buildResultShareMessage,
  resolveBenchOfficials,
} from "@/lib/matches";
import { exportLineupPdf } from "@/lib/export";

export default function MatchSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const matches = useMatchesStore((state) => state.matches);
  const deleteMatch = useMatchesStore((state) => state.deleteMatch);
  const completeMatch = useMatchesStore((state) => state.completeMatch);
  const cancelMatch = useMatchesStore((state) => state.cancelMatch);
  const reactivateMatch = useMatchesStore((state) => state.reactivateMatch);
  const players = usePlayersStore((state) => state.players);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const match = matches.find((candidate) => candidate.id === id);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [teamScoreInput, setTeamScoreInput] = useState("");
  const [opponentScoreInput, setOpponentScoreInput] = useState("");

  if (!match) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Match not found."
        description="This fixture may have been removed."
        actionLabel="Back to matches"
        actionHref="/matches"
      />
    );
  }

  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.fullName]));

  const goals = match.events.filter((event) => event.type === "goal").length;
  const cards = match.events.filter((event) => event.type === "yellow_card" || event.type === "red_card").length;
  const subs = match.events.filter((event) => event.type === "substitution").length;

  const resolvedBenchOfficials = match.lineup
    ? resolveBenchOfficials(match.lineup.benchOfficials, activeTeam.staff)
    : [];
  const fixtureMessage = buildFixtureShareMessage(match, activeTeam.name);
  const resultMessage = buildResultShareMessage(match, activeTeam.name, playerNames);
  const lineupMessage = buildLineupShareMessage(match, activeTeam.name, playerNames, resolvedBenchOfficials);

  function handleDownloadLineup() {
    if (!match || !match.lineup) return;
    exportLineupPdf(match, activeTeam, players, resolvedBenchOfficials);
  }

  function handleDelete() {
    deleteMatch(id);
    router.push("/matches");
  }

  function handleFinish() {
    const teamScore = Number(teamScoreInput);
    const opponentScore = Number(opponentScoreInput);
    if (Number.isNaN(teamScore) || Number.isNaN(opponentScore)) return;
    completeMatch(id, teamScore, opponentScore);
    setFinishOpen(false);
  }

  function handleCancel() {
    cancelMatch(id);
    setCancelOpen(false);
  }

  function handleReactivate() {
    reactivateMatch(id);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/matches"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Matches
      </Link>
      <SectionHeader title="Match Summary" />

      <div className="flex flex-wrap gap-2">
        <Link href={`/matches/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
          <Pencil />
          Edit
        </Link>
        <Link href={`/matches/${id}/lineup`} className={buttonVariants({ variant: "outline" })}>
          <ListChecks />
          {match.lineup ? "Edit Lineup" : "Build Lineup"}
        </Link>
        <Link href={`/matches/${id}/events`} className={buttonVariants({ variant: "outline" })}>
          <Zap />
          Record Events
        </Link>
        <Modal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button variant="destructive">
              <Trash2 />
              Delete Match
            </Button>
          }
          title="Delete this match?"
          description={`The fixture vs ${match.opponent} will be removed. This can't be undone.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Match
              </Button>
            </>
          }
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Trophy className="size-3.5" />
            {match.competition} · {match.matchType}
          </div>
          <ScoreBoard
            teamName={activeTeam.name}
            teamLogo={activeTeam.logo}
            opponent={match.opponent}
            teamScore={match.teamScore}
            opponentScore={match.opponentScore}
            status={match.status}
          />
          <div className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              {format(new Date(match.date), "EEE, d MMM yyyy")} · {match.kickoffTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {match.venue} ({match.isHome ? "Home" : "Away"})
            </span>
            {match.referee && (
              <span className="flex items-center gap-1.5">
                <UserCheck className="size-4" />
                Referee: {match.referee}
              </span>
            )}
          </div>
          {match.notes && <p className="text-sm text-muted-foreground">{match.notes}</p>}
        </CardContent>
      </Card>

      {match.status === "upcoming" && (
        <div className="flex flex-wrap gap-2">
          <Modal
            open={finishOpen}
            onOpenChange={setFinishOpen}
            trigger={<Button>Enter Final Score</Button>}
            title="Enter final score"
            description={`${activeTeam.name} vs ${match.opponent}`}
            footer={
              <>
                <Button variant="outline" onClick={() => setFinishOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFinish}>Save Result</Button>
              </>
            }
          >
            <div className="flex items-center gap-3">
              <Field>
                <FieldLabel htmlFor="teamScoreInput">{activeTeam.name}</FieldLabel>
                <FieldContent>
                  <Input
                    id="teamScoreInput"
                    type="number"
                    inputMode="numeric"
                    value={teamScoreInput}
                    onChange={(event) => setTeamScoreInput(event.target.value)}
                  />
                </FieldContent>
              </Field>
              <span className="pt-6 text-muted-foreground">–</span>
              <Field>
                <FieldLabel htmlFor="opponentScoreInput">{match.opponent}</FieldLabel>
                <FieldContent>
                  <Input
                    id="opponentScoreInput"
                    type="number"
                    inputMode="numeric"
                    value={opponentScoreInput}
                    onChange={(event) => setOpponentScoreInput(event.target.value)}
                  />
                </FieldContent>
              </Field>
            </div>
          </Modal>
          <Modal
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            trigger={<Button variant="ghost">Cancel Match</Button>}
            title="Cancel this match?"
            description={`The fixture vs ${match.opponent} will be marked as cancelled. You can reactivate it later.`}
            footer={
              <>
                <Button variant="outline" onClick={() => setCancelOpen(false)}>
                  Keep Match
                </Button>
                <Button variant="destructive" onClick={handleCancel}>
                  Cancel Match
                </Button>
              </>
            }
          />
        </div>
      )}

      {match.status === "cancelled" && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleReactivate}>
            <RotateCcw />
            Reactivate Match
          </Button>
        </div>
      )}

      {match.status === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Match Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <StatisticWidget icon={<Goal />} label="Goals" value={goals} />
              <StatisticWidget icon={<Square />} label="Cards" value={cards} />
              <StatisticWidget icon={<Zap />} label="Subs" value={subs} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="lineup">Lineup</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="pt-4">
              <MatchTimeline events={match.events} playerNames={playerNames} />
            </TabsContent>

            <TabsContent value="lineup" className="pt-4">
              {match.lineup ? (
                <div className="max-h-125 overflow-y-auto pr-1">
                  <LineupView lineup={match.lineup} players={players} staff={activeTeam.staff} />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <p className="text-sm text-muted-foreground">No lineup has been set for this match yet.</p>
                  <Link href={`/matches/${id}/lineup`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Build Lineup
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {match.status === "upcoming" && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(fixtureMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <MessageCircle />
            Share Fixture
          </a>
        )}
        {match.status === "completed" && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(resultMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <MessageCircle />
            Share Result
          </a>
        )}
        {match.lineup && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(lineupMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <MessageCircle />
            Share Lineup
          </a>
        )}
        {match.lineup && (
          <Button type="button" variant="outline" onClick={handleDownloadLineup}>
            <Download />
            Download Lineup
          </Button>
        )}
      </div>
    </div>
  );
}

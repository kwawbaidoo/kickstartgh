"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  ListChecks,
  MessageCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Match } from "@/mock/matches";
import { useMatchesStore } from "@/store/matches-store";
import { usePlayersStore } from "@/store/players-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { buildFixtureShareMessage, buildLineupShareMessage, buildResultShareMessage } from "@/lib/matches";
import { exportLineupPdf } from "@/lib/export";

function MatchActionsMenu({ match }: { match: Match }) {
  const deleteMatch = useMatchesStore((state) => state.deleteMatch);
  const completeMatch = useMatchesStore((state) => state.completeMatch);
  const cancelMatch = useMatchesStore((state) => state.cancelMatch);
  const players = usePlayersStore((state) => state.players);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [teamScoreInput, setTeamScoreInput] = useState("");
  const [opponentScoreInput, setOpponentScoreInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.full_name]));
  const fixtureMessage = buildFixtureShareMessage(match, activeTeam.name);
  const resultMessage = buildResultShareMessage(match, activeTeam.name, playerNames);
  const lineupMessage = buildLineupShareMessage(match, activeTeam.name, playerNames);

  function handleDownloadLineup() {
    if (!match.lineup) return;
    exportLineupPdf(match, activeTeam, players);
  }

  function handleDelete() {
    setError(null);
    deleteMatch(match.id)
      .then(() => setDeleteOpen(false))
      .catch(() => setError("Couldn't delete this match. Please try again."));
  }

  function handleCancel() {
    setError(null);
    cancelMatch(match.id)
      .then(() => setCancelOpen(false))
      .catch(() => setError("Couldn't cancel this match. Please try again."));
  }

  function handleFinish() {
    const team_score = Number(teamScoreInput);
    const opponent_score = Number(opponentScoreInput);
    if (Number.isNaN(team_score) || Number.isNaN(opponent_score)) return;
    setError(null);
    completeMatch(match.id, team_score, opponent_score)
      .then(() => {
        setFinishOpen(false);
        setTeamScoreInput("");
        setOpponentScoreInput("");
      })
      .catch(() => setError("Couldn't save the result. Please try again."));
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" />}>
          <MoreVertical className="size-4" />
          <span className="sr-only">More actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/matches/${match.id}`} />}>
            <Eye />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/matches/${match.id}/edit`} />}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/matches/${match.id}/lineup`} />}>
            <ListChecks />
            {match.lineup ? "Edit Lineup" : "Build Lineup"}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/matches/${match.id}/events`} />}>
            <Zap />
            Record Events
          </DropdownMenuItem>

          {match.status === "upcoming" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFinishOpen(true)}>
                <Trophy />
                Enter Final Score
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCancelOpen(true)}>
                <XCircle />
                Cancel Match
              </DropdownMenuItem>
            </>
          )}

          {(match.status === "upcoming" || match.status === "completed" || match.lineup) && (
            <DropdownMenuSeparator />
          )}
          {match.status === "upcoming" && (
            <DropdownMenuItem
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(fixtureMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle />
              Share Fixture
            </DropdownMenuItem>
          )}
          {match.status === "completed" && (
            <DropdownMenuItem
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(resultMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle />
              Share Result
            </DropdownMenuItem>
          )}
          {match.lineup && (
            <DropdownMenuItem
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(lineupMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle />
              Share Lineup
            </DropdownMenuItem>
          )}
          {match.lineup && (
            <DropdownMenuItem onClick={handleDownloadLineup}>
              <Download />
              Download Lineup
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete Match
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
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
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Modal>

      <Modal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this match?"
        description={`The fixture vs ${match.opponent} will be marked as cancelled. This can't be undone.`}
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
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Modal>

      <Modal
        open={finishOpen}
        onOpenChange={setFinishOpen}
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
        {error && <p className="pb-2 text-sm text-destructive">{error}</p>}
        <div className="flex items-center gap-3">
          <Field>
            <FieldLabel htmlFor={`team_score-${match.id}`}>{activeTeam.name}</FieldLabel>
            <FieldContent>
              <Input
                id={`team_score-${match.id}`}
                type="number"
                inputMode="numeric"
                value={teamScoreInput}
                onChange={(event) => setTeamScoreInput(event.target.value)}
              />
            </FieldContent>
          </Field>
          <span className="pt-6 text-muted-foreground">–</span>
          <Field>
            <FieldLabel htmlFor={`opponent_score-${match.id}`}>{match.opponent}</FieldLabel>
            <FieldContent>
              <Input
                id={`opponent_score-${match.id}`}
                type="number"
                inputMode="numeric"
                value={opponentScoreInput}
                onChange={(event) => setOpponentScoreInput(event.target.value)}
              />
            </FieldContent>
          </Field>
        </div>
      </Modal>
    </>
  );
}

export { MatchActionsMenu };

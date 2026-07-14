"use client";

import { useState } from "react";
import Link from "next/link";
import {
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

function MatchActionsMenu({ match }: { match: Match }) {
  const deleteMatch = useMatchesStore((state) => state.deleteMatch);
  const completeMatch = useMatchesStore((state) => state.completeMatch);
  const cancelMatch = useMatchesStore((state) => state.cancelMatch);
  const players = usePlayersStore((state) => state.players);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [teamScoreInput, setTeamScoreInput] = useState("");
  const [opponentScoreInput, setOpponentScoreInput] = useState("");

  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.fullName]));
  const fixtureMessage = buildFixtureShareMessage(match, activeTeam.name);
  const resultMessage = buildResultShareMessage(match, activeTeam.name, playerNames);
  const lineupMessage = buildLineupShareMessage(match, activeTeam.name, playerNames);

  function handleDelete() {
    deleteMatch(match.id);
    setDeleteOpen(false);
  }

  function handleFinish() {
    const teamScore = Number(teamScoreInput);
    const opponentScore = Number(opponentScoreInput);
    if (Number.isNaN(teamScore) || Number.isNaN(opponentScore)) return;
    completeMatch(match.id, teamScore, opponentScore);
    setFinishOpen(false);
    setTeamScoreInput("");
    setOpponentScoreInput("");
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
              <DropdownMenuItem onClick={() => cancelMatch(match.id)}>
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
      />

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
        <div className="flex items-center gap-3">
          <Field>
            <FieldLabel htmlFor={`teamScore-${match.id}`}>{activeTeam.name}</FieldLabel>
            <FieldContent>
              <Input
                id={`teamScore-${match.id}`}
                type="number"
                inputMode="numeric"
                value={teamScoreInput}
                onChange={(event) => setTeamScoreInput(event.target.value)}
              />
            </FieldContent>
          </Field>
          <span className="pt-6 text-muted-foreground">–</span>
          <Field>
            <FieldLabel htmlFor={`opponentScore-${match.id}`}>{match.opponent}</FieldLabel>
            <FieldContent>
              <Input
                id={`opponentScore-${match.id}`}
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

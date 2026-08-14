"use client";

import { useState } from "react";

import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventTypeConfig } from "@/config/matches";
import type { Lineup, MatchEvent, MatchEventInput, MatchEventType } from "@/mock/matches";
import type { Player } from "@/mock/players";
import { getStartingPlayerIds } from "@/lib/matches";

const eventTypes: MatchEventType[] = ["goal", "yellow_card", "red_card", "substitution", "injury"];

type EventRecorderProps = {
  lineup: Lineup;
  squad: Player[];
  events: MatchEvent[];
  onRecord: (event: MatchEventInput) => void;
};

function EventRecorder({ lineup, squad, events, onRecord }: EventRecorderProps) {
  const [activeType, setActiveType] = useState<MatchEventType | null>(null);
  const [minute, setMinute] = useState("");
  const [player_id, setPlayerId] = useState<string | null>(null);
  const [assistId, setAssistId] = useState<string | null>(null);
  const [player_out_id, setPlayerOutId] = useState<string | null>(null);
  const [player_in_id, setPlayerInId] = useState<string | null>(null);

  const playerMap = new Map(squad.map((player) => [player.id, player]));
  const startingIds = getStartingPlayerIds(lineup);
  const squadIds = [...startingIds, ...lineup.substitutes];
  const squadPlayers = squadIds
    .map((id) => playerMap.get(id))
    .filter((player): player is Player => !!player);

  const onPitchIds = new Set(startingIds);
  for (const event of events) {
    if (event.type === "substitution") {
      onPitchIds.delete(event.player_out_id);
      onPitchIds.add(event.player_in_id);
    }
  }
  const onPitchPlayers = squadPlayers.filter((player) => onPitchIds.has(player.id));
  const benchPlayers = squadPlayers.filter((player) => !onPitchIds.has(player.id));

  const squadItems = Object.fromEntries(squadPlayers.map((player) => [player.id, player.full_name]));
  const onPitchItems = Object.fromEntries(onPitchPlayers.map((player) => [player.id, player.full_name]));
  const benchItems = Object.fromEntries(benchPlayers.map((player) => [player.id, player.full_name]));

  function openModal(type: MatchEventType) {
    setActiveType(type);
    setMinute("");
    setPlayerId(null);
    setAssistId(null);
    setPlayerOutId(null);
    setPlayerInId(null);
  }

  function closeModal() {
    setActiveType(null);
  }

  const minuteValue = Number(minute);
  const isMinuteValid = minute !== "" && minuteValue >= 1 && minuteValue <= 120;
  const isValid =
    isMinuteValid &&
    (activeType === "goal" || activeType === "yellow_card" || activeType === "red_card" || activeType === "injury"
      ? !!player_id
      : activeType === "substitution"
        ? !!player_out_id && !!player_in_id
        : false);

  function handleSubmit() {
    if (!isValid || !activeType) return;

    if (activeType === "goal" && player_id) {
      onRecord({ type: "goal", minute: minuteValue, player_id, assist_player_id: assistId ?? undefined });
    } else if ((activeType === "yellow_card" || activeType === "red_card") && player_id) {
      onRecord({ type: activeType, minute: minuteValue, player_id });
    } else if (activeType === "substitution" && player_out_id && player_in_id) {
      onRecord({ type: "substitution", minute: minuteValue, player_out_id, player_in_id });
    } else if (activeType === "injury" && player_id) {
      onRecord({ type: "injury", minute: minuteValue, player_id });
    }
    closeModal();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {eventTypes.map((type) => {
          const config = eventTypeConfig[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => openModal(type)}
              className="flex flex-col items-center gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-transform active:scale-95"
            >
              <span className="text-3xl leading-none">{config.emoji}</span>
              <span className="text-xs font-medium text-foreground">{config.label}</span>
            </button>
          );
        })}
      </div>

      <Modal
        open={activeType !== null}
        onOpenChange={(open) => !open && closeModal()}
        title={activeType ? eventTypeConfig[activeType].label : ""}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid}>
              Record
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="event-minute">Minute</FieldLabel>
            <FieldContent>
              <Input
                id="event-minute"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 73"
                value={minute}
                onChange={(event) => setMinute(event.target.value)}
              />
            </FieldContent>
          </Field>

          {activeType === "goal" && (
            <>
              <Field>
                <FieldLabel>Scorer</FieldLabel>
                <FieldContent>
                  <Select items={squadItems} value={player_id} onValueChange={setPlayerId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select scorer" />
                    </SelectTrigger>
                    <SelectContent>
                      {squadPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Assist</FieldLabel>
                <FieldContent>
                  <Select items={squadItems} value={assistId} onValueChange={setAssistId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {squadPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </>
          )}

          {(activeType === "yellow_card" || activeType === "red_card" || activeType === "injury") && (
            <Field>
              <FieldLabel>Player</FieldLabel>
              <FieldContent>
                <Select items={squadItems} value={player_id} onValueChange={setPlayerId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {squadPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          )}

          {activeType === "substitution" && (
            <>
              <Field>
                <FieldLabel>Player out</FieldLabel>
                <FieldContent>
                  <Select items={onPitchItems} value={player_out_id} onValueChange={setPlayerOutId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select player out" />
                    </SelectTrigger>
                    <SelectContent>
                      {onPitchPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Player in</FieldLabel>
                <FieldContent>
                  <Select items={benchItems} value={player_in_id} onValueChange={setPlayerInId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select player in" />
                    </SelectTrigger>
                    <SelectContent>
                      {benchPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export { EventRecorder };

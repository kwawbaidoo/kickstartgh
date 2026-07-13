"use client";

import { useState } from "react";

import { FormationSelector } from "@/components/matches/FormationSelector";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Player } from "@/mock/players";
import type { Formation, Lineup } from "@/mock/matches";
import { getFormationSlots } from "@/lib/matches";
import { cn, getInitials } from "@/lib/utils";

type LineupBuilderProps = {
  squad: Player[];
  initialLineup: Lineup | null;
  onSave: (lineup: Lineup) => void;
};

function LineupBuilder({ squad, initialLineup, onSave }: LineupBuilderProps) {
  const [formation, setFormation] = useState<Formation>(initialLineup?.formation ?? "4-4-2");
  const initialSlotCount = getFormationSlots(formation).length;
  const [startingXI, setStartingXI] = useState<(string | null)[]>(() =>
    initialLineup && initialLineup.formation === formation
      ? initialLineup.startingXI
      : Array(initialSlotCount).fill(null)
  );
  const [substitutes, setSubstitutes] = useState<string[]>(initialLineup?.substitutes ?? []);
  const [captainId, setCaptainId] = useState<string | undefined>(initialLineup?.captainId);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);

  const slots = getFormationSlots(formation);
  const playerMap = new Map(squad.map((player) => [player.id, player]));
  const assignedIds = new Set(startingXI.filter((id): id is string => !!id));
  const availablePlayers = squad.filter((player) => !assignedIds.has(player.id));
  const filledCount = startingXI.filter(Boolean).length;
  const canSave = filledCount === slots.length;

  function handleFormationChange(next: Formation) {
    setFormation(next);
    setStartingXI(Array(getFormationSlots(next).length).fill(null));
    setCaptainId(undefined);
  }

  function handleSlotTap(index: number) {
    const currentId = startingXI[index];
    if (currentId) {
      setStartingXI((prev) => prev.map((id, i) => (i === index ? null : id)));
      if (captainId === currentId) setCaptainId(undefined);
    } else {
      setPickerSlotIndex(index);
    }
  }

  function assignPlayer(playerId: string) {
    if (pickerSlotIndex === null) return;
    setStartingXI((prev) => prev.map((id, i) => (i === pickerSlotIndex ? playerId : id)));
    setSubstitutes((prev) => prev.filter((id) => id !== playerId));
    setPickerSlotIndex(null);
  }

  function toggleSubstitute(playerId: string) {
    setSubstitutes((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  }

  function handleSave() {
    onSave({
      formation,
      startingXI: startingXI.filter((id): id is string => !!id),
      substitutes,
      captainId,
    });
  }

  const captainItems = Object.fromEntries(
    startingXI
      .filter((id): id is string => !!id)
      .map((id) => [id, playerMap.get(id)?.fullName ?? ""])
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <FormationSelector value={formation} onChange={handleFormationChange} />
        <span className="text-sm text-muted-foreground">
          {filledCount} of {slots.length} positions filled
        </span>
      </div>

      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-700">
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/30" />
        <div className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
        {slots.map((slot, index) => {
          const playerId = startingXI[index];
          const player = playerId ? playerMap.get(playerId) : undefined;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSlotTap(index)}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white/70",
                  player ? "bg-primary text-primary-foreground" : "bg-white/20 text-white"
                )}
              >
                {player ? getInitials(player.fullName) : "+"}
              </div>
              {player && (
                <span className="max-w-16 truncate rounded bg-black/40 px-1 text-[10px] font-medium text-white">
                  {player.fullName.split(" ")[0]}
                  {captainId === player.id ? " (C)" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Captain</span>
        <Select
          items={captainItems}
          value={captainId ?? null}
          onValueChange={(value) => setCaptainId(value ?? undefined)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select captain" />
          </SelectTrigger>
          <SelectContent>
            {startingXI
              .filter((id): id is string => !!id)
              .map((id) => (
                <SelectItem key={id} value={id}>
                  {playerMap.get(id)?.fullName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Substitutes</span>
        <div className="flex flex-wrap gap-2">
          {availablePlayers.length === 0 && (
            <span className="text-sm text-muted-foreground">No players available.</span>
          )}
          {availablePlayers.map((player) => {
            const selected = substitutes.includes(player.id);
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => toggleSubstitute(player.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {player.fullName}
                <span className="text-xs">#{player.jerseyNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button size="lg" className="w-full" disabled={!canSave} onClick={handleSave}>
        {canSave ? "Save Lineup" : `Fill all ${slots.length} positions to save`}
      </Button>

      <Sheet open={pickerSlotIndex !== null} onOpenChange={(open) => !open && setPickerSlotIndex(null)}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Select a player</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 overflow-y-auto px-4 pb-4">
            {availablePlayers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No more players available.
              </p>
            ) : (
              availablePlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => assignPlayer(player.id)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {getInitials(player.fullName)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{player.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {player.position} · #{player.jerseyNumber}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { LineupBuilder };

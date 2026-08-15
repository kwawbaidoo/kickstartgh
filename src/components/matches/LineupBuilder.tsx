"use client";

import { useState } from "react";

import { FormationSelector } from "@/components/matches/FormationSelector";
import { PitchBackground } from "@/components/matches/PitchBackground";
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
import type { Slot } from "@/config/matches";
import { positionLabels } from "@/config/matches";
import { getFormationSlots, getPitchSlotStyle } from "@/lib/matches";
import { cn, getInitials } from "@/lib/utils";

type LineupBuilderProps = {
  squad: Player[];
  initialLineup: Lineup | null;
  onSave: (lineup: Lineup) => void;
};

function LineupBuilder({ squad, initialLineup, onSave }: LineupBuilderProps) {
  const [formation, setFormation] = useState<Formation>(initialLineup?.formation ?? "4-4-2");
  const [starting_xi, setStartingXI] = useState<Partial<Record<Slot, string>>>(() =>
    initialLineup && initialLineup.formation === formation ? initialLineup.starting_xi : {}
  );
  const [substitutes, setSubstitutes] = useState<string[]>(initialLineup?.substitutes ?? []);
  const [captain_id, setCaptainId] = useState<string | undefined>(initialLineup?.captain_id);
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);

  const slots = getFormationSlots(formation);
  const playerMap = new Map(squad.map((player) => [player.id, player]));
  const assignedIds = new Set(Object.values(starting_xi));
  const availablePlayers = squad.filter((player) => !assignedIds.has(player.id));
  const filledCount = Object.keys(starting_xi).length;
  const canSave = filledCount === slots.length;

  function handleFormationChange(next: Formation) {
    setFormation(next);
    setStartingXI({});
    setCaptainId(undefined);
  }

  function handleSlotTap(slot: Slot) {
    const currentId = starting_xi[slot];
    if (currentId) {
      setStartingXI((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
      if (captain_id === currentId) setCaptainId(undefined);
    } else {
      setPickerSlot(slot);
    }
  }

  function assignPlayer(player_id: string) {
    if (pickerSlot === null) return;
    setStartingXI((prev) => ({ ...prev, [pickerSlot]: player_id }));
    setSubstitutes((prev) => prev.filter((id) => id !== player_id));
    setPickerSlot(null);
  }

  function toggleSubstitute(player_id: string) {
    setSubstitutes((prev) =>
      prev.includes(player_id) ? prev.filter((id) => id !== player_id) : [...prev, player_id]
    );
  }

  function handleSave() {
    onSave({
      formation,
      starting_xi,
      substitutes,
      captain_id,
    });
  }

  const captainItems = Object.fromEntries(
    Object.values(starting_xi).map((id) => [id, playerMap.get(id)?.full_name ?? ""])
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <FormationSelector value={formation} onChange={handleFormationChange} />
        <span className="text-sm text-muted-foreground">
          {filledCount} of {slots.length} positions filled
        </span>
      </div>

      <div className="relative aspect-[17/25] w-full overflow-hidden rounded-2xl lg:aspect-[25/17]">
        <PitchBackground />
        {slots.map((slot) => {
          const player_id = starting_xi[slot.slot];
          const player = player_id ? playerMap.get(player_id) : undefined;
          const positionLabel = positionLabels[slot.position];
          return (
            <button
              key={slot.slot}
              type="button"
              onClick={() => handleSlotTap(slot.slot)}
              style={getPitchSlotStyle(slot)}
              aria-label={player ? `${player.full_name}, ${positionLabel}` : `Assign ${positionLabel}`}
              className="absolute left-[var(--slot-left)] top-[var(--slot-top)] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 lg:left-[var(--slot-left-lg)] lg:top-[var(--slot-top-lg)]"
            >
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white/70",
                  player ? "bg-primary text-primary-foreground" : "bg-white/20 text-white"
                )}
              >
                {player ? getInitials(player.full_name) : "+"}
              </div>
              {player && (
                <span className="max-w-16 truncate rounded bg-black/40 px-1 text-[10px] font-medium text-white">
                  {player.full_name.split(" ")[0]}
                  {captain_id === player.id ? " (C)" : ""}
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
          value={captain_id ?? null}
          onValueChange={(value) => setCaptainId(value ?? undefined)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select captain" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(starting_xi).map((id) => (
              <SelectItem key={id} value={id}>
                {playerMap.get(id)?.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Substitutes</span>
        <p className="text-xs text-muted-foreground">
          Pick from the remaining squad — anyone not in the starting XI.
        </p>
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
                {player.full_name}
                <span className="text-xs">#{player.jersey_number}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button size="lg" className="w-full" disabled={!canSave} onClick={handleSave}>
        {canSave ? "Save Lineup" : `Fill all ${slots.length} positions to save`}
      </Button>

      <Sheet open={pickerSlot !== null} onOpenChange={(open) => !open && setPickerSlot(null)}>
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
                    {getInitials(player.full_name)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{player.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {player.position} · #{player.jersey_number}
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

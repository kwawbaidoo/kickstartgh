"use client";

import { useState } from "react";

import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { seasonStatusDotClasses } from "@/config/seasons";
import { useSeasonStore } from "@/store/season-store";
import { cn } from "@/lib/utils";

/**
 * Activating a season is a real, app-wide state transition (every existing
 * page — Players, Matches, Training, Reports, Dashboard — only ever shows
 * the active season's data), so switching here always confirms first rather
 * than silently flipping the whole app's context.
 */
function SeasonSelector() {
  const seasons = useSeasonStore((state) => state.seasons);
  const activeSeasonId = useSeasonStore((state) => state.activeSeasonId);
  const activateSeason = useSeasonStore((state) => state.activateSeason);
  const [pendingSeasonId, setPendingSeasonId] = useState<string | null>(null);

  const activeSeason = seasons.find((season) => season.id === activeSeasonId);
  const pendingSeason = seasons.find((season) => season.id === pendingSeasonId);

  if (!activeSeason) return null;

  const items = Object.fromEntries(seasons.map((season) => [season.id, season.name]));

  return (
    <>
      <Select
        items={items}
        value={activeSeasonId}
        onValueChange={(value) => {
          if (value && value !== activeSeasonId) setPendingSeasonId(value);
        }}
      >
        <SelectTrigger
          className="h-9 w-auto gap-1.5 border-none bg-muted px-2.5 text-sm font-medium"
          aria-label="Active season"
        >
          <span className={cn("size-2 shrink-0 rounded-full", seasonStatusDotClasses[activeSeason.status])} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((season) => (
            <SelectItem key={season.id} value={season.id}>
              {season.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Modal
        open={!!pendingSeasonId}
        onOpenChange={(open) => !open && setPendingSeasonId(null)}
        title={`Activate ${pendingSeason?.name ?? "this season"}?`}
        description={`${activeSeason.name} will move to Completed, and every new player, match, and training session will belong to ${pendingSeason?.name ?? "this season"} from now on.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingSeasonId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingSeasonId) activateSeason(pendingSeasonId);
                setPendingSeasonId(null);
              }}
            >
              Activate
            </Button>
          </>
        }
      />
    </>
  );
}

export { SeasonSelector };

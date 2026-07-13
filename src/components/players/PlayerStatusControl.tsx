"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusOptions } from "@/config/players";
import type { PlayerStatus } from "@/mock/players";
import { usePlayersStore } from "@/store/players-store";
import { toSelectItems } from "@/lib/utils";

const statusItems = toSelectItems(statusOptions);

type PlayerStatusControlProps = {
  playerId: string;
  status: PlayerStatus;
};

function PlayerStatusControl({ playerId, status }: PlayerStatusControlProps) {
  const setPlayerStatus = usePlayersStore((state) => state.setPlayerStatus);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Status</span>
      <Select
        items={statusItems}
        value={status}
        onValueChange={(value) => setPlayerStatus(playerId, value as PlayerStatus)}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { PlayerStatusControl };

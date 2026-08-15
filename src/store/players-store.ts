import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  players as seedPlayers,
  type Player,
  type PlayerSeasonRecord,
  type PlayerStatus,
} from "@/mock/players";
import { currentTeam } from "@/mock/teams";
import { DEFAULT_SEASON_ID } from "@/mock/seasons";
import type { PlayerFormInput } from "@/schemas/player";
import { useSeasonStore } from "@/store/season-store";

type PlayersState = {
  players: Player[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addPlayer: (input: PlayerFormInput) => Player;
  updatePlayer: (id: string, input: PlayerFormInput) => void;
  setPlayerStatus: (id: string, status: PlayerStatus) => void;
  deletePlayer: (id: string) => void;
  registerPlayerForSeason: (player_id: string, season_id: string, jersey_number: number) => void;
  bulkRegisterForSeason: (season_id: string, playerIds: string[], sourceSeasonId: string) => void;
  removePlayerFromSeason: (player_id: string, season_id: string) => void;
  migrateSeasonRecords: () => void;
};

const emptyStats = {
  rating: 0,
};

/** Appends a status-history entry only when the status actually changes. */
function withStatus(player: Player, status: PlayerStatus): Pick<Player, "status" | "status_history"> {
  if (player.status === status) {
    return { status: player.status, status_history: player.status_history };
  }
  return {
    status,
    status_history: [...player.status_history, { status, date: new Date().toISOString() }],
  };
}

/**
 * Global pages only ever show the active season, so the top-level
 * jersey_number/status mirror is always kept pointed at whichever
 * `season_records` entry matches the currently active season — this is what
 * lets PlayerCard, PDF exports, the lineup builder, etc. keep reading those
 * two fields directly without ever needing a season parameter threaded in.
 */
function upsertSeasonRecord(
  records: PlayerSeasonRecord[],
  season_id: string,
  jersey_number: number,
  status: PlayerStatus
): PlayerSeasonRecord[] {
  const existing = records.find((record) => record.season_id === season_id);
  if (existing) {
    return records.map((record) =>
      record.season_id === season_id ? { ...record, jersey_number, status } : record
    );
  }
  return [...records, { season_id, jersey_number, status, registered_at: new Date().toISOString() }];
}

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: seedPlayers,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addPlayer: (input) => {
        const created_at = new Date().toISOString();
        const activeSeasonId = useSeasonStore.getState().activeSeasonId;
        const newPlayer: Player = {
          id: crypto.randomUUID(),
          team_id: currentTeam.id,
          created_at,
          stats: emptyStats,
          ...input,
          status_history: [{ status: input.status, date: created_at }],
          season_records: [
            {
              season_id: activeSeasonId,
              jersey_number: input.jersey_number,
              status: input.status,
              registered_at: created_at,
            },
          ],
        };
        set({ players: [...get().players, newPlayer] });
        return newPlayer;
      },

      updatePlayer: (id, input) => {
        const activeSeasonId = useSeasonStore.getState().activeSeasonId;
        set({
          players: get().players.map((player) =>
            player.id === id
              ? {
                  ...player,
                  ...input,
                  ...withStatus(player, input.status),
                  season_records: upsertSeasonRecord(
                    player.season_records,
                    activeSeasonId,
                    input.jersey_number,
                    input.status
                  ),
                }
              : player
          ),
        });
      },

      setPlayerStatus: (id, status) => {
        const activeSeasonId = useSeasonStore.getState().activeSeasonId;
        set({
          players: get().players.map((player) =>
            player.id === id
              ? {
                  ...player,
                  ...withStatus(player, status),
                  season_records: upsertSeasonRecord(
                    player.season_records,
                    activeSeasonId,
                    player.jersey_number,
                    status
                  ),
                }
              : player
          ),
        });
      },

      registerPlayerForSeason: (player_id, season_id, jersey_number) => {
        set({
          players: get().players.map((player) =>
            player.id === player_id
              ? {
                  ...player,
                  season_records: upsertSeasonRecord(player.season_records, season_id, jersey_number, "Active"),
                }
              : player
          ),
        });
      },

      bulkRegisterForSeason: (season_id, playerIds, sourceSeasonId) => {
        set({
          players: get().players.map((player) => {
            if (!playerIds.includes(player.id)) return player;
            const sourceRecord = player.season_records.find((record) => record.season_id === sourceSeasonId);
            const jersey_number = sourceRecord?.jersey_number ?? player.jersey_number;
            return {
              ...player,
              season_records: upsertSeasonRecord(player.season_records, season_id, jersey_number, "Active"),
            };
          }),
        });
      },

      removePlayerFromSeason: (player_id, season_id) => {
        set({
          players: get().players.map((player) =>
            player.id === player_id
              ? {
                  ...player,
                  season_records: player.season_records.filter((record) => record.season_id !== season_id),
                }
              : player
          ),
        });
      },

      deletePlayer: (id) => {
        set({ players: get().players.filter((player) => player.id !== id) });
      },

      /**
       * Backfills players persisted before the Season feature existed —
       * a no-op once every player has records. Uses the static default
       * season, not whatever's active now: this data predates seasons
       * entirely, so it belongs to the original season, not the current one.
       */
      migrateSeasonRecords: () => {
        set({
          players: get().players.map((player) =>
            player.season_records && player.season_records.length > 0
              ? player
              : {
                  ...player,
                  season_records: [
                    {
                      season_id: DEFAULT_SEASON_ID,
                      jersey_number: player.jersey_number,
                      status: player.status,
                      registered_at: player.created_at,
                    },
                  ],
                }
          ),
        });
      },
    }),
    {
      name: "kickstartgh-players-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ players: state.players }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.migrateSeasonRecords();
      },
    }
  )
);

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
  registerPlayerForSeason: (playerId: string, seasonId: string, jerseyNumber: number) => void;
  bulkRegisterForSeason: (seasonId: string, playerIds: string[], sourceSeasonId: string) => void;
  removePlayerFromSeason: (playerId: string, seasonId: string) => void;
  migrateSeasonRecords: () => void;
};

const emptyStats = {
  rating: 0,
};

/** Appends a status-history entry only when the status actually changes. */
function withStatus(player: Player, status: PlayerStatus): Pick<Player, "status" | "statusHistory"> {
  if (player.status === status) {
    return { status: player.status, statusHistory: player.statusHistory };
  }
  return {
    status,
    statusHistory: [...player.statusHistory, { status, date: new Date().toISOString() }],
  };
}

/**
 * Global pages only ever show the active season, so the top-level
 * jerseyNumber/status mirror is always kept pointed at whichever
 * `seasonRecords` entry matches the currently active season — this is what
 * lets PlayerCard, PDF exports, the lineup builder, etc. keep reading those
 * two fields directly without ever needing a season parameter threaded in.
 */
function upsertSeasonRecord(
  records: PlayerSeasonRecord[],
  seasonId: string,
  jerseyNumber: number,
  status: PlayerStatus
): PlayerSeasonRecord[] {
  const existing = records.find((record) => record.seasonId === seasonId);
  if (existing) {
    return records.map((record) =>
      record.seasonId === seasonId ? { ...record, jerseyNumber, status } : record
    );
  }
  return [...records, { seasonId, jerseyNumber, status, registeredAt: new Date().toISOString() }];
}

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: seedPlayers,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addPlayer: (input) => {
        const createdAt = new Date().toISOString();
        const activeSeasonId = useSeasonStore.getState().activeSeasonId;
        const newPlayer: Player = {
          id: crypto.randomUUID(),
          teamId: currentTeam.id,
          createdAt,
          stats: emptyStats,
          ...input,
          statusHistory: [{ status: input.status, date: createdAt }],
          seasonRecords: [
            {
              seasonId: activeSeasonId,
              jerseyNumber: input.jerseyNumber,
              status: input.status,
              registeredAt: createdAt,
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
                  seasonRecords: upsertSeasonRecord(
                    player.seasonRecords,
                    activeSeasonId,
                    input.jerseyNumber,
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
                  seasonRecords: upsertSeasonRecord(
                    player.seasonRecords,
                    activeSeasonId,
                    player.jerseyNumber,
                    status
                  ),
                }
              : player
          ),
        });
      },

      registerPlayerForSeason: (playerId, seasonId, jerseyNumber) => {
        set({
          players: get().players.map((player) =>
            player.id === playerId
              ? {
                  ...player,
                  seasonRecords: upsertSeasonRecord(player.seasonRecords, seasonId, jerseyNumber, "Active"),
                }
              : player
          ),
        });
      },

      bulkRegisterForSeason: (seasonId, playerIds, sourceSeasonId) => {
        set({
          players: get().players.map((player) => {
            if (!playerIds.includes(player.id)) return player;
            const sourceRecord = player.seasonRecords.find((record) => record.seasonId === sourceSeasonId);
            const jerseyNumber = sourceRecord?.jerseyNumber ?? player.jerseyNumber;
            return {
              ...player,
              seasonRecords: upsertSeasonRecord(player.seasonRecords, seasonId, jerseyNumber, "Active"),
            };
          }),
        });
      },

      removePlayerFromSeason: (playerId, seasonId) => {
        set({
          players: get().players.map((player) =>
            player.id === playerId
              ? {
                  ...player,
                  seasonRecords: player.seasonRecords.filter((record) => record.seasonId !== seasonId),
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
            player.seasonRecords && player.seasonRecords.length > 0
              ? player
              : {
                  ...player,
                  seasonRecords: [
                    {
                      seasonId: DEFAULT_SEASON_ID,
                      jerseyNumber: player.jerseyNumber,
                      status: player.status,
                      registeredAt: player.createdAt,
                    },
                  ],
                }
          ),
        });
      },
    }),
    {
      name: "kickstartgh-players",
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

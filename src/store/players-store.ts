import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { players as seedPlayers, type Player, type PlayerStatus } from "@/mock/players";
import { currentTeam } from "@/mock/teams";
import type { PlayerFormInput } from "@/schemas/player";

type PlayersState = {
  players: Player[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addPlayer: (input: PlayerFormInput) => Player;
  updatePlayer: (id: string, input: PlayerFormInput) => void;
  setPlayerStatus: (id: string, status: PlayerStatus) => void;
  deletePlayer: (id: string) => void;
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

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: seedPlayers,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addPlayer: (input) => {
        const createdAt = new Date().toISOString();
        const newPlayer: Player = {
          id: crypto.randomUUID(),
          teamId: currentTeam.id,
          createdAt,
          stats: emptyStats,
          ...input,
          statusHistory: [{ status: input.status, date: createdAt }],
        };
        set({ players: [...get().players, newPlayer] });
        return newPlayer;
      },

      updatePlayer: (id, input) => {
        set({
          players: get().players.map((player) =>
            player.id === id ? { ...player, ...input, ...withStatus(player, input.status) } : player
          ),
        });
      },

      setPlayerStatus: (id, status) => {
        set({
          players: get().players.map((player) =>
            player.id === id ? { ...player, ...withStatus(player, status) } : player
          ),
        });
      },

      deletePlayer: (id) => {
        set({ players: get().players.filter((player) => player.id !== id) });
      },
    }),
    {
      name: "kickstartgh-players",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ players: state.players }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

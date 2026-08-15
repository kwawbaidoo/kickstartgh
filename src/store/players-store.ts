import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Player, PlayerSeasonRecord, PlayerStatus } from "@/mock/players";
import type { PlayerFormInput } from "@/schemas/player";
import { apiFetch } from "@/lib/api-client";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useSeasonStore } from "@/store/season-store";

type PlayersState = {
  players: Player[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  fetchPlayers: () => Promise<void>;
  fetchSeasonRoster: (season_id: string) => Promise<void>;
  addPlayer: (input: PlayerFormInput) => Promise<Player>;
  updatePlayer: (id: string, input: PlayerFormInput) => Promise<void>;
  setPlayerStatus: (id: string, status: PlayerStatus) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  registerPlayerForSeason: (player_id: string, season_id: string, jersey_number: number) => Promise<void>;
  bulkRegisterForSeason: (season_id: string, playerIds: string[], sourceSeasonId: string) => Promise<void>;
  removePlayerFromSeason: (player_id: string, season_id: string) => Promise<void>;
};

/**
 * Confirmed live 2026-08-15 (Create/Get/Update Player, Update Status, Register/Carry
 * Forward/Remove-from-Season all called directly against the real server) — response
 * `data` payloads are camelCase, same as every other domain. Two confirmed mismatches
 * vs. the original mock model: `emergencyContact` is a plain string (not a structured
 * {name,phone,email} object), and there is no `email` or marketability-profile field on
 * the real Player entity at all — dropped from the frontend per product decision.
 */
type PlayerResponse = {
  id: string;
  teamId: string;
  fullName: string;
  nickname: string | null;
  photo: string | null;
  position: Player["position"];
  secondaryPosition: Player["position"] | null;
  jerseyNumber: number;
  preferredFoot: Player["preferred_foot"];
  dateOfBirth: string;
  phone: string | null;
  emergencyContact: string | null;
  village: string | null;
  previousClub: string | null;
  status: PlayerStatus;
  statusHistory: { status: PlayerStatus; date: string }[];
  createdAt: string;
};

/**
 * A season "roster" entry is its own resource on the real backend (not embedded on
 * Player) — confirmed via `GET /seasons/:id/players`, `POST /seasons/:id/players`,
 * `POST /seasons/:id/players/carry-forward`. Only the list/roster variant embeds the
 * full nested `player`; register/carry-forward responses don't.
 */
type SeasonRegistrationResponse = {
  id: string;
  playerId: string;
  seasonId: string;
  jerseyNumber: number;
  status: PlayerStatus;
  registeredAt: string;
  player?: PlayerResponse;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
};

function mapPlayer(response: PlayerResponse, season_records: PlayerSeasonRecord[] = []): Player {
  return {
    id: response.id,
    team_id: response.teamId,
    full_name: response.fullName,
    nickname: response.nickname ?? undefined,
    photo: response.photo ?? undefined,
    position: response.position,
    secondary_position: response.secondaryPosition ?? undefined,
    jersey_number: response.jerseyNumber,
    preferred_foot: response.preferredFoot,
    date_of_birth: response.dateOfBirth,
    phone: response.phone ?? undefined,
    emergency_contact: response.emergencyContact ?? undefined,
    village: response.village ?? undefined,
    previous_club: response.previousClub ?? undefined,
    status: response.status,
    status_history: response.statusHistory,
    created_at: response.createdAt,
    season_records,
  };
}

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

function upsertSeasonRecord(
  records: PlayerSeasonRecord[],
  season_id: string,
  jersey_number: number,
  status: PlayerStatus,
  registered_at?: string
): PlayerSeasonRecord[] {
  const existing = records.find((record) => record.season_id === season_id);
  if (existing) {
    return records.map((record) =>
      record.season_id === season_id ? { ...record, jersey_number, status } : record
    );
  }
  return [
    ...records,
    { season_id, jersey_number, status, registered_at: registered_at ?? new Date().toISOString() },
  ];
}

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchPlayers: async () => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) return;
        const existingRecords = new Map(get().players.map((player) => [player.id, player.season_records]));
        const response = await apiFetch<PaginatedResponse<PlayerResponse>>(`/teams/${team_id}/players`);
        const players = response.items.map((item) => mapPlayer(item, existingRecords.get(item.id) ?? []));
        set({ players });
      },

      fetchSeasonRoster: async (season_id) => {
        const response = await apiFetch<PaginatedResponse<SeasonRegistrationResponse>>(
          `/seasons/${season_id}/players`
        );
        set((state) => {
          const players = [...state.players];
          for (const registration of response.items) {
            const index = players.findIndex((player) => player.id === registration.playerId);
            if (index === -1) {
              if (!registration.player) continue;
              players.push(
                mapPlayer(registration.player, [
                  {
                    season_id,
                    jersey_number: registration.jerseyNumber,
                    status: registration.status,
                    registered_at: registration.registeredAt,
                  },
                ])
              );
              continue;
            }
            players[index] = {
              ...players[index],
              season_records: upsertSeasonRecord(
                players[index].season_records,
                season_id,
                registration.jerseyNumber,
                registration.status,
                registration.registeredAt
              ),
            };
          }
          return { players };
        });
      },

      addPlayer: async (input) => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) throw new Error("Create a team before adding a player.");
        const activeSeasonId = useSeasonStore.getState().activeSeasonId;
        const response = await apiFetch<PlayerResponse>(`/teams/${team_id}/players`, {
          method: "POST",
          body: input,
        });
        const player = mapPlayer(
          response,
          activeSeasonId
            ? [
                {
                  season_id: activeSeasonId,
                  jersey_number: response.jerseyNumber,
                  status: response.status,
                  registered_at: response.createdAt,
                },
              ]
            : []
        );
        set((state) => ({ players: [...state.players, player] }));
        return player;
      },

      updatePlayer: async (id, input) => {
        const activeSeasonId = useSeasonStore.getState().activeSeasonId;
        const response = await apiFetch<PlayerResponse>(`/players/${id}`, {
          method: "PATCH",
          body: input,
        });
        set((state) => ({
          players: state.players.map((player) =>
            player.id === id
              ? mapPlayer(
                  response,
                  activeSeasonId
                    ? upsertSeasonRecord(player.season_records, activeSeasonId, response.jerseyNumber, response.status)
                    : player.season_records
                )
              : player
          ),
        }));
      },

      setPlayerStatus: async (id, status) => {
        const activeSeasonId = useSeasonStore.getState().activeSeasonId;
        await apiFetch<PlayerResponse>(`/players/${id}/status`, {
          method: "PATCH",
          body: { status },
        });
        set((state) => ({
          players: state.players.map((player) =>
            player.id === id
              ? {
                  ...player,
                  ...withStatus(player, status),
                  season_records: activeSeasonId
                    ? upsertSeasonRecord(player.season_records, activeSeasonId, player.jersey_number, status)
                    : player.season_records,
                }
              : player
          ),
        }));
      },

      deletePlayer: async (id) => {
        await apiFetch<void>(`/players/${id}`, { method: "DELETE" });
        set((state) => ({ players: state.players.filter((player) => player.id !== id) }));
      },

      registerPlayerForSeason: async (player_id, season_id, jersey_number) => {
        const response = await apiFetch<SeasonRegistrationResponse>(`/seasons/${season_id}/players`, {
          method: "POST",
          body: { player_id, jersey_number },
        });
        set((state) => ({
          players: state.players.map((player) =>
            player.id === player_id
              ? {
                  ...player,
                  season_records: upsertSeasonRecord(
                    player.season_records,
                    season_id,
                    response.jerseyNumber,
                    response.status,
                    response.registeredAt
                  ),
                }
              : player
          ),
        }));
      },

      bulkRegisterForSeason: async (season_id, playerIds, sourceSeasonId) => {
        const response = await apiFetch<SeasonRegistrationResponse[]>(
          `/seasons/${season_id}/players/carry-forward`,
          { method: "POST", body: { source_season_id: sourceSeasonId, source_player_ids: playerIds } }
        );
        set((state) => {
          const players = [...state.players];
          for (const registration of response) {
            const index = players.findIndex((player) => player.id === registration.playerId);
            if (index === -1) continue;
            players[index] = {
              ...players[index],
              season_records: upsertSeasonRecord(
                players[index].season_records,
                season_id,
                registration.jerseyNumber,
                registration.status,
                registration.registeredAt
              ),
            };
          }
          return { players };
        });
      },

      removePlayerFromSeason: async (player_id, season_id) => {
        await apiFetch<void>(`/seasons/${season_id}/players/${player_id}`, { method: "DELETE" });
        set((state) => ({
          players: state.players.map((player) =>
            player.id === player_id
              ? {
                  ...player,
                  season_records: player.season_records.filter((record) => record.season_id !== season_id),
                }
              : player
          ),
        }));
      },
    }),
    {
      name: "kickstartgh-players-v4",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ players: state.players }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

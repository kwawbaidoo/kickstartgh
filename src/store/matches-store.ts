import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Lineup, Match, MatchEvent, MatchEventInput, MatchStatus, MatchType } from "@/mock/matches";
import type { MatchFormInput } from "@/schemas/match";
import { apiFetch } from "@/lib/api-client";
import { useOnboardingStore } from "@/store/onboarding-store";

type MatchesState = {
  matches: Match[];
  hasHydrated: boolean;
  isLoading: boolean;
  setHasHydrated: (value: boolean) => void;
  fetchMatches: () => Promise<void>;
  addMatch: (input: MatchFormInput) => Promise<Match>;
  updateMatch: (id: string, input: MatchFormInput) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  setLineup: (match_id: string, lineup: Lineup) => Promise<void>;
  addEvent: (match_id: string, event: MatchEventInput) => Promise<void>;
  removeEvent: (match_id: string, event_id: string) => Promise<void>;
  completeMatch: (match_id: string, team_score: number, opponent_score: number) => Promise<void>;
  cancelMatch: (match_id: string) => Promise<void>;
};

function fromFormInput(input: MatchFormInput) {
  const { homeAway, ...rest } = input;
  return { ...rest, is_home: homeAway === "Home" };
}

/**
 * Confirmed live 2026-08-15 (Create/Get/Update Match, Set Lineup, Add/Delete Match
 * Event, Complete/Cancel Match all called directly against the real server) —
 * response `data` payloads are camelCase, same as every other domain. Two confirmed
 * gaps vs. the original mock model, both resolved per product decision: `bench_officials`
 * has no backend field at all (silently dropped by `Set Lineup`, dropped from the
 * frontend), and there is no "reactivate a cancelled match" endpoint (dropped the
 * frontend action/buttons — a cancelled match is terminal until the backend adds one).
 */
type LineupResponse = {
  formation: Lineup["formation"];
  startingXI: Lineup["starting_xi"];
  substitutes: string[];
  captainId: string | null;
};

type MatchEventResponse = {
  id: string;
  matchId: string;
  type: MatchEvent["type"];
  minute: number;
  playerId: string | null;
  assistPlayerId: string | null;
  playerOutId: string | null;
  playerInId: string | null;
};

type MatchResponse = {
  id: string;
  teamId: string;
  seasonId: string;
  opponent: string;
  competition: string;
  matchType: MatchType;
  venue: string;
  isHome: boolean;
  date: string;
  kickoffTime: string;
  referee: string | null;
  notes: string | null;
  poster: string | null;
  status: MatchStatus;
  teamScore: number | null;
  opponentScore: number | null;
  lineup?: LineupResponse | null;
  events?: MatchEventResponse[];
  createdAt: string;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
};

function mapLineup(response: LineupResponse): Lineup {
  return {
    formation: response.formation,
    starting_xi: response.startingXI,
    substitutes: response.substitutes,
    captain_id: response.captainId ?? undefined,
  };
}

function mapMatchEvent(response: MatchEventResponse): MatchEvent {
  const { id, type, minute } = response;
  if (type === "goal") {
    return { id, type, minute, player_id: response.playerId!, assist_player_id: response.assistPlayerId ?? undefined };
  }
  if (type === "substitution") {
    return { id, type, minute, player_out_id: response.playerOutId!, player_in_id: response.playerInId! };
  }
  return { id, type, minute, player_id: response.playerId! };
}

/**
 * Only List/Get Match responses reliably include `lineup`/`events`; every mutation
 * response (create/update/complete/cancel/set-lineup) omits whichever of the two it
 * didn't just change — so those call sites pass the match's current local values as
 * fallbacks rather than losing them.
 */
function mapMatch(response: MatchResponse, fallbackLineup: Lineup | null = null, fallbackEvents: MatchEvent[] = []): Match {
  return {
    id: response.id,
    team_id: response.teamId,
    season_id: response.seasonId,
    opponent: response.opponent,
    competition: response.competition,
    match_type: response.matchType,
    venue: response.venue,
    is_home: response.isHome,
    date: response.date,
    kickoff_time: response.kickoffTime.slice(0, 5),
    referee: response.referee ?? undefined,
    notes: response.notes ?? undefined,
    poster: response.poster ?? undefined,
    status: response.status,
    team_score: response.teamScore ?? undefined,
    opponent_score: response.opponentScore ?? undefined,
    lineup: response.lineup ? mapLineup(response.lineup) : fallbackLineup,
    events: response.events ? response.events.map(mapMatchEvent) : fallbackEvents,
    created_at: response.createdAt,
  };
}

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      matches: [],
      hasHydrated: false,
      isLoading: true,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchMatches: async () => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) {
          set({ isLoading: false });
          return;
        }
        try {
          const response = await apiFetch<PaginatedResponse<MatchResponse>>(`/teams/${team_id}/matches`);
          set({ matches: response.items.map((item) => mapMatch(item)), isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addMatch: async (input) => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) throw new Error("Create a team before scheduling a match.");
        const response = await apiFetch<MatchResponse>(`/teams/${team_id}/matches`, {
          method: "POST",
          body: fromFormInput(input),
        });
        const match = mapMatch(response);
        set((state) => ({ matches: [...state.matches, match] }));
        return match;
      },

      updateMatch: async (id, input) => {
        const existing = get().matches.find((match) => match.id === id);
        const response = await apiFetch<MatchResponse>(`/matches/${id}`, {
          method: "PATCH",
          body: fromFormInput(input),
        });
        const match = mapMatch(response, existing?.lineup ?? null, existing?.events ?? []);
        set((state) => ({ matches: state.matches.map((m) => (m.id === id ? match : m)) }));
      },

      deleteMatch: async (id) => {
        await apiFetch<void>(`/matches/${id}`, { method: "DELETE" });
        set((state) => ({ matches: state.matches.filter((match) => match.id !== id) }));
      },

      setLineup: async (match_id, lineup) => {
        const existing = get().matches.find((match) => match.id === match_id);
        const response = await apiFetch<MatchResponse>(`/matches/${match_id}/lineup`, {
          method: "PUT",
          body: {
            formation: lineup.formation,
            starting_xi: lineup.starting_xi,
            substitutes: lineup.substitutes,
            captain_id: lineup.captain_id ?? null,
          },
        });
        const match = mapMatch(response, null, existing?.events ?? []);
        set((state) => ({ matches: state.matches.map((m) => (m.id === match_id ? match : m)) }));
      },

      addEvent: async (match_id, event) => {
        const response = await apiFetch<MatchEventResponse>(`/matches/${match_id}/events`, {
          method: "POST",
          body: event,
        });
        const newEvent = mapMatchEvent(response);
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === match_id ? { ...match, events: [...match.events, newEvent] } : match
          ),
        }));
      },

      removeEvent: async (match_id, event_id) => {
        await apiFetch<void>(`/matches/${match_id}/events/${event_id}`, { method: "DELETE" });
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === match_id
              ? { ...match, events: match.events.filter((event) => event.id !== event_id) }
              : match
          ),
        }));
      },

      completeMatch: async (match_id, team_score, opponent_score) => {
        const existing = get().matches.find((match) => match.id === match_id);
        const response = await apiFetch<MatchResponse>(`/matches/${match_id}/complete`, {
          method: "POST",
          body: { team_score, opponent_score },
        });
        const match = mapMatch(response, existing?.lineup ?? null, existing?.events ?? []);
        set((state) => ({ matches: state.matches.map((m) => (m.id === match_id ? match : m)) }));
      },

      cancelMatch: async (match_id) => {
        const existing = get().matches.find((match) => match.id === match_id);
        const response = await apiFetch<MatchResponse>(`/matches/${match_id}/cancel`, { method: "POST" });
        const match = mapMatch(response, existing?.lineup ?? null, existing?.events ?? []);
        set((state) => ({ matches: state.matches.map((m) => (m.id === match_id ? match : m)) }));
      },
    }),
    {
      name: "kickstartgh-matches-v4",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ matches: state.matches }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

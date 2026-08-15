import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  matches as seedMatches,
  type Lineup,
  type Match,
  type MatchEvent,
  type MatchEventInput,
} from "@/mock/matches";
import { currentTeam } from "@/mock/teams";
import { DEFAULT_SEASON_ID } from "@/mock/seasons";
import type { MatchFormInput } from "@/schemas/match";
import { useSeasonStore } from "@/store/season-store";

type MatchesState = {
  matches: Match[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addMatch: (input: MatchFormInput) => Match;
  updateMatch: (id: string, input: MatchFormInput) => void;
  deleteMatch: (id: string) => void;
  setLineup: (match_id: string, lineup: Lineup) => void;
  addEvent: (match_id: string, event: MatchEventInput) => void;
  removeEvent: (match_id: string, event_id: string) => void;
  completeMatch: (match_id: string, team_score: number, opponent_score: number) => void;
  cancelMatch: (match_id: string) => void;
  reactivateMatch: (match_id: string) => void;
  migrateSeasonIds: () => void;
};

function fromFormInput(input: MatchFormInput) {
  const { homeAway, ...rest } = input;
  return { ...rest, is_home: homeAway === "Home" };
}

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      matches: seedMatches,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addMatch: (input) => {
        const newMatch: Match = {
          id: crypto.randomUUID(),
          team_id: currentTeam.id,
          season_id: useSeasonStore.getState().activeSeasonId,
          status: "upcoming",
          lineup: null,
          events: [],
          created_at: new Date().toISOString(),
          ...fromFormInput(input),
        };
        set({ matches: [...get().matches, newMatch] });
        return newMatch;
      },

      updateMatch: (id, input) => {
        set({
          matches: get().matches.map((match) =>
            match.id === id ? { ...match, ...fromFormInput(input) } : match
          ),
        });
      },

      deleteMatch: (id) => {
        set({ matches: get().matches.filter((match) => match.id !== id) });
      },

      setLineup: (match_id, lineup) => {
        set({
          matches: get().matches.map((match) => (match.id === match_id ? { ...match, lineup } : match)),
        });
      },

      addEvent: (match_id, event) => {
        const newEvent = { ...event, id: crypto.randomUUID() } as MatchEvent;
        set({
          matches: get().matches.map((match) =>
            match.id === match_id ? { ...match, events: [...match.events, newEvent] } : match
          ),
        });
      },

      removeEvent: (match_id, event_id) => {
        set({
          matches: get().matches.map((match) =>
            match.id === match_id
              ? { ...match, events: match.events.filter((event) => event.id !== event_id) }
              : match
          ),
        });
      },

      completeMatch: (match_id, team_score, opponent_score) => {
        set({
          matches: get().matches.map((match) =>
            match.id === match_id ? { ...match, status: "completed", team_score, opponent_score } : match
          ),
        });
      },

      cancelMatch: (match_id) => {
        set({
          matches: get().matches.map((match) =>
            match.id === match_id ? { ...match, status: "cancelled" } : match
          ),
        });
      },

      reactivateMatch: (match_id) => {
        set({
          matches: get().matches.map((match) =>
            match.id === match_id ? { ...match, status: "upcoming" } : match
          ),
        });
      },

      /** Backfills matches persisted before the Season feature existed. */
      migrateSeasonIds: () => {
        set({
          matches: get().matches.map((match) =>
            match.season_id ? match : { ...match, season_id: DEFAULT_SEASON_ID }
          ),
        });
      },
    }),
    {
      name: "kickstartgh-matches-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ matches: state.matches }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.migrateSeasonIds();
      },
    }
  )
);

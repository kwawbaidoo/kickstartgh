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
import type { MatchFormInput } from "@/schemas/match";

type MatchesState = {
  matches: Match[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addMatch: (input: MatchFormInput) => Match;
  updateMatch: (id: string, input: MatchFormInput) => void;
  deleteMatch: (id: string) => void;
  setLineup: (matchId: string, lineup: Lineup) => void;
  addEvent: (matchId: string, event: MatchEventInput) => void;
  removeEvent: (matchId: string, eventId: string) => void;
  completeMatch: (matchId: string, teamScore: number, opponentScore: number) => void;
  cancelMatch: (matchId: string) => void;
  reactivateMatch: (matchId: string) => void;
};

function fromFormInput(input: MatchFormInput) {
  const { homeAway, ...rest } = input;
  return { ...rest, isHome: homeAway === "Home" };
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
          teamId: currentTeam.id,
          status: "upcoming",
          lineup: null,
          events: [],
          createdAt: new Date().toISOString(),
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

      setLineup: (matchId, lineup) => {
        set({
          matches: get().matches.map((match) => (match.id === matchId ? { ...match, lineup } : match)),
        });
      },

      addEvent: (matchId, event) => {
        const newEvent = { ...event, id: crypto.randomUUID() } as MatchEvent;
        set({
          matches: get().matches.map((match) =>
            match.id === matchId ? { ...match, events: [...match.events, newEvent] } : match
          ),
        });
      },

      removeEvent: (matchId, eventId) => {
        set({
          matches: get().matches.map((match) =>
            match.id === matchId
              ? { ...match, events: match.events.filter((event) => event.id !== eventId) }
              : match
          ),
        });
      },

      completeMatch: (matchId, teamScore, opponentScore) => {
        set({
          matches: get().matches.map((match) =>
            match.id === matchId ? { ...match, status: "completed", teamScore, opponentScore } : match
          ),
        });
      },

      cancelMatch: (matchId) => {
        set({
          matches: get().matches.map((match) =>
            match.id === matchId ? { ...match, status: "cancelled" } : match
          ),
        });
      },

      reactivateMatch: (matchId) => {
        set({
          matches: get().matches.map((match) =>
            match.id === matchId ? { ...match, status: "upcoming" } : match
          ),
        });
      },
    }),
    {
      name: "kickstartgh-matches",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ matches: state.matches }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

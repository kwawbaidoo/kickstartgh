import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { seasons as seedSeasons, type Season, type SeasonStatus } from "@/mock/seasons";
import { currentTeam } from "@/mock/teams";

export type SeasonInput = {
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  objectives?: string;
  competition_category?: string;
  budget?: number;
  color_primary?: string;
  color_secondary?: string;
};

type SeasonState = {
  seasons: Season[];
  activeSeasonId: string;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addSeason: (input: SeasonInput) => Season;
  updateSeason: (id: string, input: SeasonInput) => void;
  activateSeason: (id: string) => void;
  archiveSeason: (id: string) => void;
  renameSeason: (id: string, name: string) => void;
  duplicateSeason: (id: string, name: string) => Season | undefined;
};

const initialActiveSeason = seedSeasons.find((season) => season.status === "active") ?? seedSeasons[0];

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      seasons: seedSeasons,
      activeSeasonId: initialActiveSeason?.id ?? "",
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addSeason: (input) => {
        const newSeason: Season = {
          id: crypto.randomUUID(),
          team_id: currentTeam.id,
          status: "upcoming" as SeasonStatus,
          created_at: new Date().toISOString(),
          ...input,
        };
        set({ seasons: [...get().seasons, newSeason] });
        return newSeason;
      },

      updateSeason: (id, input) => {
        set({
          seasons: get().seasons.map((season) => (season.id === id ? { ...season, ...input } : season)),
        });
      },

      activateSeason: (id) => {
        set({
          seasons: get().seasons.map((season) => {
            if (season.id === id) return { ...season, status: "active" as SeasonStatus };
            if (season.status === "active") return { ...season, status: "completed" as SeasonStatus };
            return season;
          }),
          activeSeasonId: id,
        });
      },

      archiveSeason: (id) => {
        if (get().activeSeasonId === id) return;
        set({
          seasons: get().seasons.map((season) =>
            season.id === id ? { ...season, status: "archived" as SeasonStatus } : season
          ),
        });
      },

      renameSeason: (id, name) => {
        set({
          seasons: get().seasons.map((season) => (season.id === id ? { ...season, name } : season)),
        });
      },

      duplicateSeason: (id, name) => {
        const source = get().seasons.find((season) => season.id === id);
        if (!source) return undefined;
        const duplicate: Season = {
          ...source,
          id: crypto.randomUUID(),
          name,
          status: "upcoming",
          created_at: new Date().toISOString(),
        };
        set({ seasons: [...get().seasons, duplicate] });
        return duplicate;
      },
    }),
    {
      name: "kickstartgh-seasons-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Season, SeasonStatus } from "@/mock/seasons";
import { apiFetch } from "@/lib/api-client";
import { useOnboardingStore } from "@/store/onboarding-store";

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

type SeasonResponse = {
  id: string;
  teamId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
  description: string | null;
  objectives: string | null;
  competitionCategory: string | null;
  budget: number | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  createdAt: string;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
};

function mapSeason(response: SeasonResponse): Season {
  return {
    id: response.id,
    team_id: response.teamId,
    name: response.name,
    start_date: response.startDate,
    end_date: response.endDate,
    status: response.status,
    description: response.description ?? undefined,
    objectives: response.objectives ?? undefined,
    competition_category: response.competitionCategory ?? undefined,
    budget: response.budget ?? undefined,
    color_primary: response.colorPrimary ?? undefined,
    color_secondary: response.colorSecondary ?? undefined,
    created_at: response.createdAt,
  };
}

function deriveActiveSeasonId(seasons: Season[]): string {
  return seasons.find((season) => season.status === "active")?.id ?? "";
}

type SeasonState = {
  seasons: Season[];
  activeSeasonId: string;
  hasHydrated: boolean;
  isLoading: boolean;
  setHasHydrated: (value: boolean) => void;
  fetchSeasons: () => Promise<void>;
  addSeason: (input: SeasonInput) => Promise<Season>;
  updateSeason: (id: string, input: SeasonInput) => Promise<void>;
  activateSeason: (id: string) => Promise<void>;
  archiveSeason: (id: string) => Promise<void>;
  renameSeason: (id: string, name: string) => Promise<void>;
  duplicateSeason: (id: string, name: string) => Promise<Season>;
};

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      seasons: [],
      activeSeasonId: "",
      hasHydrated: false,
      isLoading: true,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchSeasons: async () => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) {
          set({ isLoading: false });
          return;
        }
        try {
          const response = await apiFetch<PaginatedResponse<SeasonResponse>>(
            `/teams/${team_id}/seasons`
          );
          const seasons = response.items.map(mapSeason);
          set({ seasons, activeSeasonId: deriveActiveSeasonId(seasons), isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addSeason: async (input) => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) throw new Error("Create a team before adding a season.");
        const response = await apiFetch<SeasonResponse>(`/teams/${team_id}/seasons`, {
          method: "POST",
          body: input,
        });
        const season = mapSeason(response);
        set((state) => ({ seasons: [...state.seasons, season] }));
        return season;
      },

      updateSeason: async (id, input) => {
        const response = await apiFetch<SeasonResponse>(`/seasons/${id}`, {
          method: "PATCH",
          body: input,
        });
        const season = mapSeason(response);
        set((state) => ({ seasons: state.seasons.map((s) => (s.id === id ? season : s)) }));
      },

      activateSeason: async (id) => {
        await apiFetch<SeasonResponse>(`/seasons/${id}/activate`, { method: "POST" });
        await get().fetchSeasons();
      },

      archiveSeason: async (id) => {
        if (get().activeSeasonId === id) return;
        const response = await apiFetch<SeasonResponse>(`/seasons/${id}/archive`, { method: "POST" });
        const season = mapSeason(response);
        set((state) => ({ seasons: state.seasons.map((s) => (s.id === id ? season : s)) }));
      },

      renameSeason: async (id, name) => {
        const response = await apiFetch<SeasonResponse>(`/seasons/${id}/rename`, {
          method: "PATCH",
          body: { name },
        });
        const season = mapSeason(response);
        set((state) => ({ seasons: state.seasons.map((s) => (s.id === id ? season : s)) }));
      },

      duplicateSeason: async (id, name) => {
        const response = await apiFetch<SeasonResponse>(`/seasons/${id}/duplicate`, {
          method: "POST",
          body: { name },
        });
        const season = mapSeason(response);
        set((state) => ({ seasons: [...state.seasons, season] }));
        return season;
      },
    }),
    {
      name: "kickstartgh-seasons-v4",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ seasons: state.seasons, activeSeasonId: state.activeSeasonId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

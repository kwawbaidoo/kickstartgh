"use client";

import { useEffect } from "react";

import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useReportsStore } from "@/store/reports-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useSettingsStore } from "@/store/settings-store";
import { useSeasonStore } from "@/store/season-store";
import { useAuthStore } from "@/store/auth-store";

function StoreHydration() {
  useEffect(() => {
    Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      const { token, fetchCurrentUser, signOut } = useAuthStore.getState();
      if (token) fetchCurrentUser().catch(() => signOut());
    });
    useSeasonStore.persist.rehydrate();
    usePlayersStore.persist.rehydrate();
    useMatchesStore.persist.rehydrate();
    useAttendanceStore.persist.rehydrate();
    useReportsStore.persist.rehydrate();
    Promise.resolve(useOnboardingStore.persist.rehydrate()).then(async () => {
      if (!useOnboardingStore.getState().team_id) {
        useSeasonStore.setState({ isLoading: false });
        useMatchesStore.setState({ isLoading: false });
        useAttendanceStore.setState({ isLoading: false });
        return;
      }
      await useSeasonStore.getState().fetchSeasons();
      usePlayersStore
        .getState()
        .fetchPlayers()
        .then(() => {
          const activeSeasonId = useSeasonStore.getState().activeSeasonId;
          if (activeSeasonId) usePlayersStore.getState().fetchSeasonRoster(activeSeasonId).catch(() => {});
        })
        .catch(() => {});
      useMatchesStore.getState().fetchMatches();
      useAttendanceStore.getState().fetchSessions();
    });
    useSettingsStore.persist.rehydrate();
  }, []);

  return null;
}

export { StoreHydration };

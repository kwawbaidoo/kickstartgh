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
      if (!token) {
        useSettingsStore.setState({ isLoading: false });
        return;
      }
      fetchCurrentUser()
        .then(() => {
          Promise.allSettled([
            useSettingsStore.getState().fetchPreferences(),
            useSettingsStore.getState().fetchNotifications(),
            useSettingsStore.getState().fetchSecurity(),
          ]).then(() => useSettingsStore.setState({ isLoading: false }));
        })
        .catch(() => {
          useSettingsStore.setState({ isLoading: false });
          signOut();
        });
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
        useReportsStore.setState({ isLoading: false });
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
      Promise.allSettled([
        useReportsStore.getState().fetchTemplates(),
        useReportsStore.getState().fetchHistory(),
      ]).then(() => useReportsStore.setState({ isLoading: false }));
    });
    useSettingsStore.persist.rehydrate();
  }, []);

  return null;
}

export { StoreHydration };

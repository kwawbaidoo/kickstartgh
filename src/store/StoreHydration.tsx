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

/** Nothing team-scoped is coming, so release every loading flag that gates on it. */
function releaseTeamScopedLoading() {
  useOnboardingStore.getState().setTeamResolved(true);
  useSeasonStore.setState({ isLoading: false });
  useMatchesStore.setState({ isLoading: false });
  useAttendanceStore.setState({ isLoading: false });
  useReportsStore.setState({ isLoading: false });
}

/**
 * Rehydrates every persisted store, then loads server state in dependency order.
 *
 * The ordering matters and used to be wrong: the team-scoped block ran in parallel with
 * the auth block and bailed out whenever the *locally* persisted `team_id` was null. That
 * made team membership a per-browser fact — an owner on a second device, or anyone who
 * cleared site data, looked like they had no team at all. `GET /me` is the authority, so
 * it now resolves first and `adoptServerTeam` reconciles local state before anything
 * team-scoped is requested.
 */
function StoreHydration() {
  useEffect(() => {
    void (async () => {
      await Promise.all([
        useAuthStore.persist.rehydrate(),
        useOnboardingStore.persist.rehydrate(),
        useSeasonStore.persist.rehydrate(),
        usePlayersStore.persist.rehydrate(),
        useMatchesStore.persist.rehydrate(),
        useAttendanceStore.persist.rehydrate(),
        useReportsStore.persist.rehydrate(),
        useSettingsStore.persist.rehydrate(),
      ]);

      const { token, fetchCurrentUser, signOut } = useAuthStore.getState();
      if (!token) {
        useSettingsStore.setState({ isLoading: false });
        releaseTeamScopedLoading();
        return;
      }

      let serverTeamId: string | null = null;
      try {
        serverTeamId = await fetchCurrentUser();
      } catch {
        useSettingsStore.setState({ isLoading: false });
        releaseTeamScopedLoading();
        signOut();
        return;
      }

      // Personal settings don't depend on a team, so they load alongside it rather than after.
      const personalSettings = Promise.allSettled([
        useSettingsStore.getState().fetchPreferences(),
        useSettingsStore.getState().fetchNotifications(),
        useSettingsStore.getState().fetchSecurity(),
      ]).then(() => useSettingsStore.setState({ isLoading: false }));

      await useOnboardingStore.getState().adoptServerTeam(serverTeamId).catch(() => {});
      useOnboardingStore.getState().setTeamResolved(true);

      if (!useOnboardingStore.getState().team_id) {
        releaseTeamScopedLoading();
        await personalSettings;
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

      await personalSettings;
    })();
  }, []);

  return null;
}

export { StoreHydration };

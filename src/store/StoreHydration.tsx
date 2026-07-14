"use client";

import { useEffect } from "react";

import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useReportsStore } from "@/store/reports-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useSettingsStore } from "@/store/settings-store";

function StoreHydration() {
  useEffect(() => {
    usePlayersStore.persist.rehydrate();
    useMatchesStore.persist.rehydrate();
    useAttendanceStore.persist.rehydrate();
    useReportsStore.persist.rehydrate();
    useOnboardingStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
  }, []);

  return null;
}

export { StoreHydration };

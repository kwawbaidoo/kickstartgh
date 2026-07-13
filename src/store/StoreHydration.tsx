"use client";

import { useEffect } from "react";

import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";

function StoreHydration() {
  useEffect(() => {
    usePlayersStore.persist.rehydrate();
    useMatchesStore.persist.rehydrate();
  }, []);

  return null;
}

export { StoreHydration };

"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return window.location.origin;
}

function getServerSnapshot() {
  return "";
}

/**
 * SSR-safe `window.location.origin` — empty string until hydrated on the
 * client, so building a shareable link never trips a hydration mismatch
 * (the origin can't be known on the server and never changes without a full
 * page reload, which is exactly what useSyncExternalStore is for).
 */
export function useOrigin(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

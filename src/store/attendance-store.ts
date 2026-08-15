import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  attendanceSessions,
  type AttendanceSession,
  type AttendanceStatus,
} from "@/mock/attendance";
import { currentTeam } from "@/mock/teams";
import { DEFAULT_SEASON_ID } from "@/mock/seasons";
import type { TrainingFormInput } from "@/schemas/training";
import { useSeasonStore } from "@/store/season-store";

type AttendanceState = {
  sessions: AttendanceSession[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addSession: (input: TrainingFormInput) => AttendanceSession;
  updateSession: (id: string, input: TrainingFormInput) => void;
  deleteSession: (id: string) => void;
  setAttendance: (session_id: string, player_id: string, status: AttendanceStatus) => void;
  setBulkAttendance: (session_id: string, playerIds: string[], status: AttendanceStatus) => void;
  completeSession: (id: string) => void;
  cancelSession: (id: string) => void;
  migrateSeasonIds: () => void;
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      sessions: attendanceSessions,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addSession: (input) => {
        const newSession: AttendanceSession = {
          id: crypto.randomUUID(),
          team_id: currentTeam.id,
          season_id: useSeasonStore.getState().activeSeasonId,
          status: "upcoming",
          records: {},
          created_at: new Date().toISOString(),
          ...input,
        };
        set({ sessions: [...get().sessions, newSession] });
        return newSession;
      },

      updateSession: (id, input) => {
        set({
          sessions: get().sessions.map((session) =>
            session.id === id ? { ...session, ...input } : session
          ),
        });
      },

      deleteSession: (id) => {
        set({ sessions: get().sessions.filter((session) => session.id !== id) });
      },

      setAttendance: (session_id, player_id, status) => {
        set({
          sessions: get().sessions.map((session) =>
            session.id === session_id
              ? { ...session, records: { ...session.records, [player_id]: status } }
              : session
          ),
        });
      },

      setBulkAttendance: (session_id, playerIds, status) => {
        set({
          sessions: get().sessions.map((session) => {
            if (session.id !== session_id) return session;
            const records = { ...session.records };
            for (const player_id of playerIds) records[player_id] = status;
            return { ...session, records };
          }),
        });
      },

      completeSession: (id) => {
        set({
          sessions: get().sessions.map((session) =>
            session.id === id ? { ...session, status: "completed" } : session
          ),
        });
      },

      cancelSession: (id) => {
        set({
          sessions: get().sessions.map((session) =>
            session.id === id ? { ...session, status: "cancelled" } : session
          ),
        });
      },

      /** Backfills sessions persisted before the Season feature existed. */
      migrateSeasonIds: () => {
        set({
          sessions: get().sessions.map((session) =>
            session.season_id ? session : { ...session, season_id: DEFAULT_SEASON_ID }
          ),
        });
      },
    }),
    {
      name: "kickstartgh-attendance-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ sessions: state.sessions }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.migrateSeasonIds();
      },
    }
  )
);

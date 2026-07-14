import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  attendanceSessions,
  type AttendanceSession,
  type AttendanceStatus,
} from "@/mock/attendance";
import { currentTeam } from "@/mock/teams";
import type { TrainingFormInput } from "@/schemas/training";

type AttendanceState = {
  sessions: AttendanceSession[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addSession: (input: TrainingFormInput) => AttendanceSession;
  updateSession: (id: string, input: TrainingFormInput) => void;
  deleteSession: (id: string) => void;
  setAttendance: (sessionId: string, playerId: string, status: AttendanceStatus) => void;
  setBulkAttendance: (sessionId: string, playerIds: string[], status: AttendanceStatus) => void;
  completeSession: (id: string) => void;
  cancelSession: (id: string) => void;
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
          teamId: currentTeam.id,
          status: "upcoming",
          records: {},
          createdAt: new Date().toISOString(),
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

      setAttendance: (sessionId, playerId, status) => {
        set({
          sessions: get().sessions.map((session) =>
            session.id === sessionId
              ? { ...session, records: { ...session.records, [playerId]: status } }
              : session
          ),
        });
      },

      setBulkAttendance: (sessionId, playerIds, status) => {
        set({
          sessions: get().sessions.map((session) => {
            if (session.id !== sessionId) return session;
            const records = { ...session.records };
            for (const playerId of playerIds) records[playerId] = status;
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
    }),
    {
      name: "kickstartgh-attendance",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ sessions: state.sessions }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { AttendanceSession, AttendanceStatus, TrainingFocus } from "@/mock/attendance";
import type { TrainingFormInput } from "@/schemas/training";
import { apiFetch } from "@/lib/api-client";
import { useOnboardingStore } from "@/store/onboarding-store";

type AttendanceState = {
  sessions: AttendanceSession[];
  hasHydrated: boolean;
  isLoading: boolean;
  setHasHydrated: (value: boolean) => void;
  fetchSessions: () => Promise<void>;
  addSession: (input: TrainingFormInput) => Promise<AttendanceSession>;
  updateSession: (id: string, input: TrainingFormInput) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setAttendance: (session_id: string, player_id: string, status: AttendanceStatus) => Promise<void>;
  setBulkAttendance: (session_id: string, playerIds: string[], status: AttendanceStatus) => Promise<void>;
  completeSession: (id: string) => Promise<void>;
  cancelSession: (id: string) => Promise<void>;
};

/**
 * Confirmed live 2026-08-15 (Create/Get/Update Session, Set/Bulk Attendance,
 * Complete/Cancel Session all called directly against the real server) — response
 * `data` payloads are camelCase, same as every other domain, and no gaps found this
 * time (unlike I4/I5): `records` matches the mock's assumed shape exactly, a flat
 * `{player_id: status}` map. One serialization quirk, not a real gap: an empty
 * `records` map comes back as `[]` (PHP can't distinguish an empty associative array
 * from an empty list), so `mapSession` normalizes that case to `{}`. There's also no
 * "reactivate a cancelled session" endpoint — same as Matches — but the mock never had
 * that action for sessions either, so nothing needed removing.
 */
type SessionResponse = {
  id: string;
  teamId: string;
  seasonId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  description: string | null;
  focus: TrainingFocus | null;
  equipment: string[];
  notes: string | null;
  status: AttendanceSession["status"];
  records: Record<string, AttendanceStatus> | [];
  createdAt: string;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
};

function normalizeRecords(records: Record<string, AttendanceStatus> | []): Record<string, AttendanceStatus> {
  return Array.isArray(records) ? {} : records;
}

function mapSession(response: SessionResponse): AttendanceSession {
  return {
    id: response.id,
    team_id: response.teamId,
    season_id: response.seasonId,
    title: response.title,
    date: response.date,
    start_time: response.startTime.slice(0, 5),
    end_time: response.endTime.slice(0, 5),
    venue: response.venue,
    description: response.description ?? undefined,
    focus: response.focus ?? undefined,
    equipment: response.equipment,
    notes: response.notes ?? undefined,
    status: response.status,
    records: normalizeRecords(response.records),
    created_at: response.createdAt,
  };
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      sessions: [],
      hasHydrated: false,
      isLoading: true,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchSessions: async () => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) {
          set({ isLoading: false });
          return;
        }
        try {
          const response = await apiFetch<PaginatedResponse<SessionResponse>>(`/teams/${team_id}/sessions`);
          set({ sessions: response.items.map(mapSession), isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addSession: async (input) => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) throw new Error("Create a team before scheduling a training session.");
        const response = await apiFetch<SessionResponse>(`/teams/${team_id}/sessions`, {
          method: "POST",
          body: input,
        });
        const session = mapSession(response);
        set((state) => ({ sessions: [...state.sessions, session] }));
        return session;
      },

      updateSession: async (id, input) => {
        const response = await apiFetch<SessionResponse>(`/sessions/${id}`, {
          method: "PATCH",
          body: input,
        });
        const session = mapSession(response);
        set((state) => ({ sessions: state.sessions.map((s) => (s.id === id ? session : s)) }));
      },

      deleteSession: async (id) => {
        await apiFetch<void>(`/sessions/${id}`, { method: "DELETE" });
        set((state) => ({ sessions: state.sessions.filter((session) => session.id !== id) }));
      },

      setAttendance: async (session_id, player_id, status) => {
        const response = await apiFetch<SessionResponse>(`/sessions/${session_id}/attendance/${player_id}`, {
          method: "PATCH",
          body: { status },
        });
        const session = mapSession(response);
        set((state) => ({ sessions: state.sessions.map((s) => (s.id === session_id ? session : s)) }));
      },

      setBulkAttendance: async (session_id, playerIds, status) => {
        const response = await apiFetch<SessionResponse>(`/sessions/${session_id}/attendance`, {
          method: "PATCH",
          body: { player_ids: playerIds, status },
        });
        const session = mapSession(response);
        set((state) => ({ sessions: state.sessions.map((s) => (s.id === session_id ? session : s)) }));
      },

      completeSession: async (id) => {
        const response = await apiFetch<SessionResponse>(`/sessions/${id}/complete`, { method: "POST" });
        const session = mapSession(response);
        set((state) => ({ sessions: state.sessions.map((s) => (s.id === id ? session : s)) }));
      },

      cancelSession: async (id) => {
        const response = await apiFetch<SessionResponse>(`/sessions/${id}/cancel`, { method: "POST" });
        const session = mapSession(response);
        set((state) => ({ sessions: state.sessions.map((s) => (s.id === id ? session : s)) }));
      },
    }),
    {
      name: "kickstartgh-attendance-v4",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ sessions: state.sessions }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

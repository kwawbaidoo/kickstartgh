import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { RoleId } from "@/config/roles";
import type { StaffFormInput, StaffMember, TeamDetailsInput } from "@/schemas/onboarding";
import { currentTeam } from "@/mock/teams";
import { apiFetch } from "@/lib/api-client";

export type ActiveTeam = {
  name: string;
  nickname: string;
  region: string;
  district: string;
  home_ground: string;
  year_established: number;
  logo?: string;
  cover_image?: string;
  color_primary?: string;
  color_secondary?: string;
  slogan?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  staff: StaffMember[];
  photos: string[];
};

/**
 * Assumed response shapes — postman_collection.json has no saved response examples.
 * Confirm against the real server:
 * - POST /teams, PATCH /teams/:id -> the Team object directly, with `id`
 * - POST /teams/:id/staff -> the created StaffMember, with a server `id`
 * - PATCH /teams/:id/staff/:id -> assumed to need no response body (applied optimistically)
 * - POST /teams/:id/invites -> { code }
 */
type TeamResponse = Omit<ActiveTeam, "staff" | "photos"> & { id: string };
type InviteResponse = { code: string };

type OnboardingDraft = {
  role: RoleId | null;
  invite_code: string | null;
};

type OnboardingState = {
  hasOnboarded: boolean;
  team_id: string | null;
  activeTeam: ActiveTeam;
  draft: OnboardingDraft;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setRole: (role: RoleId) => void;
  saveTeam: (team: TeamDetailsInput) => Promise<void>;
  addStaffMember: (input: StaffFormInput) => Promise<StaffMember>;
  removeStaffMember: (id: string) => Promise<void>;
  updateStaffMemberRole: (id: string, role: RoleId) => Promise<void>;
  createInvite: (role: string) => Promise<string>;
  completeOnboarding: () => void;
  resetDraft: () => void;
  addTeamPhoto: (photo: string) => void;
  removeTeamPhoto: (photo: string) => void;
};

const initialDraft: OnboardingDraft = {
  role: null,
  invite_code: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      team_id: null,
      activeTeam: {
        name: currentTeam.name,
        nickname: currentTeam.nickname,
        region: currentTeam.region,
        district: currentTeam.district,
        home_ground: currentTeam.home_ground,
        year_established: currentTeam.year_established,
        staff: [],
        photos: [],
      },
      draft: initialDraft,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      setRole: (role) => set((state) => ({ draft: { ...state.draft, role } })),

      /** Creates the team on first save (onboarding), updates it on every save after (Settings). */
      saveTeam: async (team) => {
        const team_id = get().team_id;
        const response = await apiFetch<TeamResponse>(
          team_id ? `/teams/${team_id}` : "/teams",
          { method: team_id ? "PATCH" : "POST", body: team }
        );
        set((state) => ({
          team_id: response.id,
          activeTeam: { ...state.activeTeam, ...response },
        }));
      },

      addStaffMember: async (input) => {
        const team_id = get().team_id;
        if (!team_id) throw new Error("Create the team before adding staff.");
        const member = await apiFetch<StaffMember>(`/teams/${team_id}/staff`, {
          method: "POST",
          body: input,
        });
        set((state) => ({
          activeTeam: { ...state.activeTeam, staff: [...state.activeTeam.staff, member] },
        }));
        return member;
      },

      removeStaffMember: async (id) => {
        const team_id = get().team_id;
        if (!team_id) return;
        await apiFetch<void>(`/teams/${team_id}/staff/${id}`, { method: "DELETE" });
        set((state) => ({
          activeTeam: {
            ...state.activeTeam,
            staff: state.activeTeam.staff.filter((member) => member.id !== id),
          },
        }));
      },

      updateStaffMemberRole: async (id, role) => {
        const team_id = get().team_id;
        if (!team_id) return;
        await apiFetch<void>(`/teams/${team_id}/staff/${id}`, {
          method: "PATCH",
          body: { role },
        });
        set((state) => ({
          activeTeam: {
            ...state.activeTeam,
            staff: state.activeTeam.staff.map((member) =>
              member.id === id ? { ...member, role } : member
            ),
          },
        }));
      },

      createInvite: async (role) => {
        const team_id = get().team_id;
        if (!team_id) throw new Error("Create the team before generating an invite.");
        const response = await apiFetch<InviteResponse>(`/teams/${team_id}/invites`, {
          method: "POST",
          body: { role, expires_at: null },
        });
        set((state) => ({ draft: { ...state.draft, invite_code: response.code } }));
        return response.code;
      },

      completeOnboarding: () => set({ hasOnboarded: true }),

      resetDraft: () => set({ draft: initialDraft }),

      addTeamPhoto: (photo) =>
        set((state) => ({
          activeTeam: { ...state.activeTeam, photos: [...state.activeTeam.photos, photo] },
        })),

      removeTeamPhoto: (photo) =>
        set((state) => ({
          activeTeam: {
            ...state.activeTeam,
            photos: state.activeTeam.photos.filter((existing) => existing !== photo),
          },
        })),
    }),
    {
      name: "kickstartgh-onboarding-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

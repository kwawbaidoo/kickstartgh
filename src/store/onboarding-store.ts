import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { RoleId } from "@/config/roles";
import type { StaffFormInput, StaffInviteInput, StaffMember, TeamDetailsInput } from "@/schemas/onboarding";
import type { InviteChannel } from "@/config/staff-access";
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
 * Confirmed live 2026-08-15 (POST /teams, POST /teams/:id/staff, POST /teams/:id/invites
 * all called directly against the real server) — response `data` payloads are camelCase,
 * same as auth-store.ts's finding. Mapped explicitly for the same reason documented in
 * lib/api-client.ts.
 */
type TeamResponse = {
  id: string;
  name: string;
  nickname: string;
  region: string;
  district: string;
  homeGround: string;
  yearEstablished: number;
  logo: string | null;
  coverImage: string | null;
  photos: string[];
  colorPrimary: string | null;
  colorSecondary: string | null;
  slogan: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
};

/**
 * `isActive` isn't modeled in the frontend's StaffMember type yet — nothing reads it today.
 *
 * `accessStatus`/`invitedAt` don't exist server-side either (BACKEND_GAPS.md §7.3); they're
 * read optionally so a real field takes over automatically once it's added, and default to
 * "no access" until then. Adding someone as staff never grants them a login on its own.
 */
type StaffMemberResponse = {
  id: string;
  teamId: string;
  /** Free text — teams add roles beyond the built-in four. See `staffRoleSchema`. */
  role: string;
  fullName: string;
  phone: string;
  email?: string | null;
  isActive: boolean;
  accessStatus?: StaffMember["access_status"];
  invitedAt?: string | null;
};

/**
 * `deliveredVia`/`deliveredAt` are the fields that would confirm an invite was actually
 * emailed or texted. They don't exist yet (BACKEND_GAPS.md §7.2), so `delivered` below
 * resolves false and the UI falls back to sharing the link by hand rather than claiming a
 * send that never happened.
 */
type InviteResponse = {
  id: string;
  teamId: string;
  code: string;
  role: string;
  joinUrl: string;
  expiresAt: string | null;
  redeemedAt: string | null;
  deliveredVia?: InviteChannel | null;
  deliveredAt?: string | null;
};

export type StaffInviteResult = {
  code: string;
  invite_url: string;
  channel: InviteChannel;
  /** True only when the API confirms delivery — never merely because we asked for it. */
  delivered: boolean;
};

function mapTeam(response: TeamResponse): Omit<ActiveTeam, "staff" | "photos"> & { photos: string[] } {
  return {
    name: response.name,
    nickname: response.nickname,
    region: response.region,
    district: response.district,
    home_ground: response.homeGround,
    year_established: response.yearEstablished,
    logo: response.logo ?? undefined,
    cover_image: response.coverImage ?? undefined,
    color_primary: response.colorPrimary ?? undefined,
    color_secondary: response.colorSecondary ?? undefined,
    slogan: response.slogan ?? undefined,
    facebook: response.facebook ?? undefined,
    instagram: response.instagram ?? undefined,
    tiktok: response.tiktok ?? undefined,
    website: response.website ?? undefined,
    photos: response.photos,
  };
}

function mapStaffMember(response: StaffMemberResponse): StaffMember {
  return {
    id: response.id,
    role: response.role,
    full_name: response.fullName,
    phone: response.phone,
    email: response.email ?? undefined,
    access_status: response.accessStatus ?? "no_access",
    invited_at: response.invitedAt ?? undefined,
  };
}

type OnboardingDraft = {
  role: RoleId | null;
  invite_code: string | null;
  invite_url: string | null;
};

type OnboardingState = {
  hasOnboarded: boolean;
  team_id: string | null;
  activeTeam: ActiveTeam;
  draft: OnboardingDraft;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  /**
   * True once `GET /me` has had its say about team membership. Never persisted — a stale
   * `true` from a previous session would let `TeamGate` act on a locally-cached `team_id`
   * of null and bounce an owner who *does* have a team back into creating another one.
   */
  teamResolved: boolean;
  setTeamResolved: (value: boolean) => void;
  setRole: (role: RoleId) => void;
  fetchTeam: (team_id: string) => Promise<void>;
  /** Reconciles local state with the team the server says this user belongs to. */
  adoptServerTeam: (server_team_id: string | null) => Promise<void>;
  saveTeam: (team: TeamDetailsInput) => Promise<void>;
  addStaffMember: (input: StaffFormInput) => Promise<StaffMember>;
  removeStaffMember: (id: string) => Promise<void>;
  updateStaffMemberRole: (id: string, role: string) => Promise<void>;
  inviteStaffMember: (id: string, input: StaffInviteInput) => Promise<StaffInviteResult>;
  createInvite: (role: string) => Promise<string>;
  completeOnboarding: () => void;
  resetDraft: () => void;
  addTeamPhoto: (photo: string) => void;
  removeTeamPhoto: (photo: string) => void;
};

const initialDraft: OnboardingDraft = {
  role: null,
  invite_code: null,
  invite_url: null,
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
      teamResolved: false,
      setTeamResolved: (value) => set({ teamResolved: value }),

      setRole: (role) => set((state) => ({ draft: { ...state.draft, role } })),

      fetchTeam: async (team_id) => {
        const response = await apiFetch<TeamResponse>(`/teams/${team_id}`, { method: "GET" });
        set((state) => ({
          team_id: response.id,
          activeTeam: { ...state.activeTeam, ...mapTeam(response) },
        }));
      },

      /**
       * `team_id` used to be set only by `saveTeam`, i.e. only on the device that ran the
       * onboarding wizard. That made team membership a per-browser fact: the same owner
       * signing in on a second device looked brand new and would have been walked through
       * creating a *second* team, and every `/teams/:id/...` call bailed out with "Create
       * the team before ...". The server is the authority, so this adopts what it reports
       * and pulls the real team down — otherwise the shell would render the mock team the
       * store initialises with.
       */
      adoptServerTeam: async (server_team_id) => {
        if (!server_team_id) return;
        if (get().team_id !== server_team_id) {
          set({ team_id: server_team_id, hasOnboarded: true });
        }
        await get().fetchTeam(server_team_id).catch(() => {});
      },

      /** Creates the team on first save (onboarding), updates it on every save after (Settings). */
      saveTeam: async (team) => {
        const team_id = get().team_id;
        const response = await apiFetch<TeamResponse>(
          team_id ? `/teams/${team_id}` : "/teams",
          { method: team_id ? "PATCH" : "POST", body: team }
        );
        set((state) => ({
          team_id: response.id,
          activeTeam: { ...state.activeTeam, ...mapTeam(response) },
        }));
      },

      addStaffMember: async (input) => {
        const team_id = get().team_id;
        if (!team_id) throw new Error("Create the team before adding staff.");
        const response = await apiFetch<StaffMemberResponse>(`/teams/${team_id}/staff`, {
          method: "POST",
          body: input,
        });
        const member = mapStaffMember(response);
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

      /**
       * Grants an existing staff member access to the system. Not every staff member gets
       * a login — this is the explicit, per-person step that gives one, and it's the same
       * `POST /teams/:id/invites` endpoint the player-invite link uses.
       *
       * The extra body fields (`staff_id`, `channel`, contact details) are what the
       * backend needs to send the invite itself; today it reads only `role`/`expires_at`
       * and silently discards the rest (BACKEND_GAPS.md §1.4, §7.2), so the invite record
       * is real but nothing is delivered. They're sent regardless so delivery starts
       * working the moment the backend honours them, with no frontend change.
       */
      inviteStaffMember: async (id, input) => {
        const team_id = get().team_id;
        if (!team_id) throw new Error("Create the team before inviting staff.");

        const member = get().activeTeam.staff.find((entry) => entry.id === id);
        if (!member) throw new Error("That staff member no longer exists.");

        const response = await apiFetch<InviteResponse>(`/teams/${team_id}/invites`, {
          method: "POST",
          body: {
            role: member.role,
            expires_at: null,
            staff_id: member.id,
            channel: input.channel,
            full_name: member.full_name,
            email: input.channel === "email" ? input.email : null,
            phone: input.phone,
          },
        });

        const delivered = !!response.deliveredAt || response.deliveredVia === input.channel;

        set((state) => ({
          activeTeam: {
            ...state.activeTeam,
            staff: state.activeTeam.staff.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    email: input.channel === "email" ? input.email : entry.email,
                    access_status: "invited" as const,
                    invited_at: new Date().toISOString(),
                    invite_channel: input.channel,
                    invite_code: response.code,
                    invite_url: response.joinUrl,
                  }
                : entry
            ),
          },
        }));

        return {
          code: response.code,
          invite_url: response.joinUrl,
          channel: input.channel,
          delivered,
        };
      },

      createInvite: async (role) => {
        const team_id = get().team_id;
        if (!team_id) throw new Error("Create the team before generating an invite.");
        const response = await apiFetch<InviteResponse>(`/teams/${team_id}/invites`, {
          method: "POST",
          body: { role, expires_at: null },
        });
        set((state) => ({
          draft: { ...state.draft, invite_code: response.code, invite_url: response.joinUrl },
        }));
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
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        team_id: state.team_id,
        activeTeam: state.activeTeam,
        draft: state.draft,
      }),
      /**
       * Migrated rather than key-bumped on purpose: a new persist key would drop
       * `team_id` too, and every staff/season/player write is scoped by it.
       */
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as OnboardingState | undefined;
        if (version < 1 && state?.activeTeam?.staff) {
          // Cast: pre-v1 records genuinely predate `access_status`, so the field really is
          // absent at runtime even though the current type declares it required.
          state.activeTeam.staff = (state.activeTeam.staff as Partial<StaffMember>[]).map(
            (member) => ({ ...member, access_status: member.access_status ?? "no_access" })
          ) as StaffMember[];
        }
        return state as OnboardingState;
      },
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { apiFetch } from "@/lib/api-client";
import { isOwnerRole } from "@/config/roles";
import type { FirstLoginPasswordInput, LoginInput, RegisterInput } from "@/schemas/auth";
import type { ProfileFormInput } from "@/schemas/settings";

export type AuthUser = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  photo: string | null;
  preferred_role: string | null;
  current_team_id: string | null;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  date_joined: string;
  /** Blocks the app behind the first-login password change — see `resolveMustChangePassword`. */
  must_change_password: boolean;
  /** Decides whether "signed in with no team" means "go create one" — see `resolveIsTeamOwner`. */
  is_team_owner: boolean;
};

/**
 * Confirmed live 2026-08-15 (register/login/me all called directly against the real
 * server) — response `data` payloads are camelCase, unlike request bodies (snake_case,
 * unchanged). See the note in lib/api-client.ts for why this is mapped explicitly here
 * rather than auto-converted generically.
 * - POST /auth/register -> data: UserResponse (no token — register never signs you in)
 * - POST /auth/login -> data: { user: UserResponse, token: string } — token is a Sanctum
 *   personal access token, format "{id}|{plaintext}", sent back verbatim as-is
 * - GET /me -> data: UserResponse & { teams: unknown[] } (team-membership shape not
 *   exercised yet — empty array on a brand-new account)
 * - PATCH /me/profile -> data: UserResponse, identical shape to GET /me/GET /me/profile.
 *   Confirmed live (Sprint I8) that `GET /me/profile` returns the exact same fields as
 *   `GET /me` — there is no separate "profile" concept server-side, just a dedicated
 *   PATCH-able endpoint for your own basic info. `updateProfile` below reuses `mapUser`
 *   and writes into this same `user` state, rather than Settings maintaining its own
 *   separate (and previously 100% fake, never-synced) `profile` copy.
 */
type UserResponse = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  photo: string | null;
  preferredRole: string | null;
  currentTeamId: string | null;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  dateJoined: string;
  /**
   * Not returned by the API today (BACKEND_GAPS.md §7.1) — read optionally so the gate
   * switches to the authoritative server flag the moment one is added, with no other
   * change needed here.
   */
  mustChangePassword?: boolean;
  /**
   * Neither of these exists today either (BACKEND_GAPS.md §9.1) — read optionally so a
   * real ownership signal takes over from the `preferred_role` heuristic the moment one
   * is added, with no other change here.
   */
  isTeamOwner?: boolean;
  teams?: { id?: string; role?: string }[];
};
type LoginResponse = { user: UserResponse; token: string };
type MeResponse = UserResponse & { teams?: { id?: string; role?: string }[] };

/**
 * Accounts are provisioned for owners and invited staff, never self-served, so the
 * temporary password they were sent has to be replaced before they reach the app.
 *
 * The backend has no `mustChangePassword` flag yet, so this falls back to `lastLoginAt`
 * being null — a genuine "this account has never signed in" signal the API does return.
 * That signal is single-use: it stops being null as soon as the first sign-in lands, so
 * the resolved flag is sticky across `/me` refetches (`previous`) and survives a reload
 * taken part-way through the change. An explicit server flag always wins over both.
 */
function resolveMustChangePassword(response: UserResponse, previous: AuthUser | null): boolean {
  if (typeof response.mustChangePassword === "boolean") return response.mustChangePassword;
  if (response.lastLoginAt === null) return true;
  return previous?.must_change_password === true;
}

/**
 * Whether this user is the person expected to create the team.
 *
 * There is no ownership concept in the API yet, so this falls back to `preferred_role`
 * being one of `ownerRoleIds` — set by us when the account is provisioned. That is a
 * *self-declared* field editable from Settings → Profile, so it is a heuristic and not a
 * permission: a coach who switches their preferred role to Team Manager would be offered
 * the team-creation flow. An explicit server flag (or a role on the `/me` team membership)
 * always wins over it. See BACKEND_GAPS.md §9.1.
 */
/**
 * The team this user belongs to, per the server. `currentTeamId` is the confirmed field;
 * `teams[]` is read as a fallback because its shape has never been exercised (see
 * BACKEND_INTEGRATION_TRACKER.md Sprint I1) and it may well be the only populated one.
 */
export function teamIdFromUser(response: {
  currentTeamId?: string | null;
  teams?: { id?: string }[];
}): string | null {
  return response.currentTeamId ?? response.teams?.find((team) => team.id)?.id ?? null;
}

export function resolveIsTeamOwner(response: {
  isTeamOwner?: boolean;
  teams?: { role?: string }[];
  preferredRole?: string | null;
}): boolean {
  if (typeof response.isTeamOwner === "boolean") return response.isTeamOwner;
  const membershipRole = response.teams?.find((team) => team.role)?.role;
  if (membershipRole) return membershipRole === "owner";
  return isOwnerRole(response.preferredRole);
}

function mapUser(response: UserResponse, previous: AuthUser | null = null): AuthUser {
  return {
    id: response.id,
    full_name: response.fullName,
    phone: response.phone,
    email: response.email,
    photo: response.photo,
    preferred_role: response.preferredRole,
    current_team_id: response.currentTeamId,
    two_factor_enabled: response.twoFactorEnabled,
    last_login_at: response.lastLoginAt,
    date_joined: response.dateJoined,
    must_change_password: resolveMustChangePassword(response, previous),
    is_team_owner: resolveIsTeamOwner(response),
  };
}

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /**
   * The temporary password the user just signed in with, held in memory only so the
   * forced-change screen can satisfy `current_password` without asking for it twice.
   * Excluded from `partialize` — a plaintext password never reaches localStorage, so a
   * refresh mid-change simply asks for it again.
   */
  provisional_password: string | null;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  /** Resolves to the team the server says this user belongs to, or null. */
  fetchCurrentUser: () => Promise<string | null>;
  completeFirstLogin: (input: FirstLoginPasswordInput) => Promise<void>;
  updateProfile: (input: ProfileFormInput) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      provisional_password: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      register: async (input) => {
        // Intentionally does not set token/user/isAuthenticated — creating an account
        // is not the same as signing in. The caller must send the user to sign in next.
        await apiFetch<UserResponse>("/auth/register", {
          method: "POST",
          body: {
            full_name: input.full_name,
            phone: input.phone,
            password: input.password,
            email: input.email || null,
          },
          auth: false,
        });
      },

      login: async (input) => {
        const response = await apiFetch<LoginResponse>("/auth/login", {
          method: "POST",
          body: input,
          auth: false,
        });
        const user = mapUser(response.user);
        set({
          token: response.token,
          user,
          isAuthenticated: true,
          provisional_password: user.must_change_password ? input.password : null,
        });
      },

      fetchCurrentUser: async () => {
        const response = await apiFetch<MeResponse>("/me", { method: "GET" });
        set((state) => ({ user: mapUser(response, state.user), isAuthenticated: true }));
        return teamIdFromUser(response);
      },

      completeFirstLogin: async (input) => {
        await apiFetch<void>("/me/security/password", {
          method: "POST",
          body: {
            current_password: input.current_password,
            new_password: input.new_password,
            new_password_confirmation: input.confirm_password,
          },
        });
        set((state) => ({
          provisional_password: null,
          user: state.user ? { ...state.user, must_change_password: false } : state.user,
        }));
      },

      updateProfile: async (input) => {
        const response = await apiFetch<UserResponse>("/me/profile", {
          method: "PATCH",
          body: input,
        });
        set((state) => ({ user: mapUser(response, state.user) }));
      },

      signOut: async () => {
        const token = get().token;
        set({ token: null, user: null, isAuthenticated: false, provisional_password: null });
        if (token) {
          await apiFetch<void>("/auth/logout", { method: "POST" }).catch(() => {});
        }
      },
    }),
    {
      name: "kickstartgh-auth-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

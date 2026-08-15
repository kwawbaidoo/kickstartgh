import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { apiFetch } from "@/lib/api-client";
import type { LoginInput, RegisterInput } from "@/schemas/auth";

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
};
type LoginResponse = { user: UserResponse; token: string };
type MeResponse = UserResponse & { teams: unknown[] };

function mapUser(response: UserResponse): AuthUser {
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
  };
}

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
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
        set({ token: response.token, user: mapUser(response.user), isAuthenticated: true });
      },

      fetchCurrentUser: async () => {
        const response = await apiFetch<MeResponse>("/me", { method: "GET" });
        set({ user: mapUser(response), isAuthenticated: true });
      },

      signOut: async () => {
        const token = get().token;
        set({ token: null, user: null, isAuthenticated: false });
        if (token) {
          await apiFetch<void>("/auth/logout", { method: "POST" }).catch(() => {});
        }
      },
    }),
    {
      name: "kickstartgh-auth-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

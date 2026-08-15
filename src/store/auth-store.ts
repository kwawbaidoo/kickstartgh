import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { apiFetch } from "@/lib/api-client";
import type { LoginInput, RegisterInput } from "@/schemas/auth";

export type AuthUser = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
};

/**
 * Response shapes are assumed (postman_collection.json has no saved response
 * examples) — confirm against the real server once reachable:
 * - POST /auth/register -> just creates the account. Deliberately does NOT sign the
 *   user in — Register and Login are separate steps by design (see AuthScreen), so a
 *   successful register() leaves isAuthenticated false until the user explicitly logs
 *   in with their new credentials.
 * - POST /auth/login -> { token, user }
 * - GET /me -> the user object directly
 */
type AuthResponse = { token: string; user: AuthUser };
type MeResponse = AuthUser;

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
        await apiFetch<void>("/auth/register", {
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
        const response = await apiFetch<AuthResponse>("/auth/login", {
          method: "POST",
          body: input,
          auth: false,
        });
        set({ token: response.token, user: response.user, isAuthenticated: true });
      },

      fetchCurrentUser: async () => {
        const user = await apiFetch<MeResponse>("/me", { method: "GET" });
        set({ user, isAuthenticated: true });
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

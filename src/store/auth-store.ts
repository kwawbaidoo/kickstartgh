import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { SignUpInput } from "@/schemas/auth";

export type AuthUser = {
  fullName: string;
  email: string;
  phone: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  signUp: (input: SignUpInput) => void;
  signIn: (identifier: string) => void;
  signOut: () => void;
};

function guessNameFromIdentifier(identifier: string) {
  if (!identifier.includes("@")) return identifier;
  return identifier
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      signUp: (input) =>
        set({
          isAuthenticated: true,
          user: { fullName: input.fullName, email: input.email, phone: input.phone },
        }),

      signIn: (identifier) => {
        const existing = get().user;
        set({
          isAuthenticated: true,
          user:
            existing && (existing.email === identifier || existing.fullName === identifier)
              ? existing
              : existing ?? {
                  fullName: guessNameFromIdentifier(identifier),
                  email: identifier.includes("@") ? identifier : "",
                  phone: "",
                },
        });
      },

      signOut: () => set({ isAuthenticated: false }),
    }),
    {
      name: "kickstartgh-auth",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

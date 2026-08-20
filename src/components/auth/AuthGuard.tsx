"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/store/auth-store";

/**
 * Protects everything rendered inside it behind a signed-in session. Relies on
 * `StoreHydration` (mounted alongside this in the same layout) to rehydrate the auth
 * store; this component only reacts to that state — waits for `hasHydrated` before
 * deciding, to avoid a false "not authenticated" flash on a fresh page load, then
 * redirects to `/` (sign in) if there's no session.
 *
 * Signed in but still on a provisioned temporary password is also blocked, to
 * `/auth/first-login` — accounts are created for owners and invited staff rather than
 * self-served, so nobody reaches the app on a password someone else chose for them. That
 * route deliberately sits outside every layout wrapping this component, or the redirect
 * would loop.
 */
function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mustChangePassword = useAuthStore((state) => state.user?.must_change_password === true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (mustChangePassword) {
      router.replace("/auth/first-login");
    }
  }, [hasHydrated, isAuthenticated, mustChangePassword, router]);

  if (!hasHydrated || !isAuthenticated || mustChangePassword) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LoadingSkeleton className="size-10 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}

export { AuthGuard };

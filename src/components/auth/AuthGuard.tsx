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
 */
function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LoadingSkeleton className="size-10 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}

export { AuthGuard };

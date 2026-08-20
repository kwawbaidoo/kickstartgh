"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { FirstLoginForm } from "@/components/auth/FirstLoginForm";
import { fadeInUp } from "@/lib/motion";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { postSignInPath } from "@/lib/auth-routing";

/**
 * The gate every provisioned account passes through once. Sits outside the `(app)` and
 * `onboarding` layouts on purpose — those wrap `AuthGuard`, which redirects here, so
 * rendering inside one would loop. It rehydrates the two stores it needs itself, the same
 * way `AuthScreen` does.
 */
function FirstLoginScreen() {
  const router = useRouter();
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mustChangePassword = useAuthStore((state) => state.user?.must_change_password);
  const fullName = useAuthStore((state) => state.user?.full_name);
  const onboardingHydrated = useOnboardingStore((state) => state.hasHydrated);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useOnboardingStore.persist.rehydrate();
  }, []);

  const ready = authHydrated && onboardingHydrated;

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (!mustChangePassword) {
      router.replace(postSignInPath());
    }
  }, [ready, isAuthenticated, mustChangePassword, router]);

  if (!ready || !isAuthenticated || !mustChangePassword) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LoadingSkeleton className="size-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl p-2 sm:p-4 lg:rounded-2xl">
          <CardContent className="flex flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-xl font-semibold text-foreground">
                  Choose your password
                </h1>
                <p className="text-sm text-muted-foreground">
                  {fullName ? `Welcome, ${fullName.split(" ")[0]}. ` : ""}
                  Your account was set up with a temporary password. Pick your own to finish
                  signing in.
                </p>
              </div>
            </div>

            <FirstLoginForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export { FirstLoginScreen };

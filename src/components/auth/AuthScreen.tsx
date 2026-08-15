"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { AuthHero } from "@/components/auth/AuthHero";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { fadeInUp } from "@/lib/motion";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";

type AuthTab = "signin" | "signup";

const copy: Record<AuthTab, { title: string; description: string }> = {
  signin: {
    title: "Welcome back",
    description: "Sign in to get back to your team.",
  },
  signup: {
    title: "Create your account",
    description: "Set up KickStartGH for your team in a minute.",
  },
};

function AuthScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("signin");
  const [registeredPhone, setRegisteredPhone] = useState<string | null>(null);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingHydrated = useOnboardingStore((state) => state.hasHydrated);

  // Registering only creates the account — it never signs the user in. Hand off to the
  // Sign In tab with the phone prefilled so the explicit sign-in step is one field away.
  function handleRegistered(phone: string) {
    setRegisteredPhone(phone);
    setTab("signin");
  }

  // This page sits outside the (app)/onboarding layouts (and their StoreHydration), so
  // it rehydrates the two stores it needs itself — same pattern as the public player
  // profile page. Already-signed-in visitors get bounced straight past the sign-in form.
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useOnboardingStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (authHydrated && onboardingHydrated && isAuthenticated) {
      router.replace(useOnboardingStore.getState().hasOnboarded ? "/dashboard" : "/onboarding");
    }
  }, [authHydrated, onboardingHydrated, isAuthenticated, router]);

  if (!authHydrated || !onboardingHydrated || isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LoadingSkeleton className="size-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      <AuthHero className="lg:w-[46%] lg:shrink-0" />

      <div className="relative z-10 -mt-6 flex flex-1 flex-col items-center px-4 pb-10 lg:mt-0 lg:justify-center lg:px-12 lg:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="w-full max-w-md"
        >
          <Card className="gap-0 rounded-3xl p-2 sm:p-4 lg:rounded-2xl">
            <CardContent className="flex flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-1 text-center lg:text-left">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {copy[tab].title}
                </h2>
                <p className="text-sm text-muted-foreground">{copy[tab].description}</p>
              </div>

              {registeredPhone && tab === "signin" && (
                <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                  Account created. Sign in with your new password to continue.
                </p>
              )}

              <Tabs
                value={tab}
                onValueChange={(value) => {
                  setTab(value as AuthTab);
                  if (value !== "signin") setRegisteredPhone(null);
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="pt-6">
                  <LoginForm key={registeredPhone ?? "signin"} defaultPhone={registeredPhone ?? ""} />
                </TabsContent>
                <TabsContent value="signup" className="pt-6">
                  <RegisterForm onRegistered={handleRegistered} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export { AuthScreen };

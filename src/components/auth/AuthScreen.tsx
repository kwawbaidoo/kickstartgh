"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthHero } from "@/components/auth/AuthHero";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { fadeInUp } from "@/lib/motion";

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
  const [tab, setTab] = useState<AuthTab>("signin");

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

              <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as AuthTab)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="pt-6">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="signup" className="pt-6">
                  <SignUpForm />
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

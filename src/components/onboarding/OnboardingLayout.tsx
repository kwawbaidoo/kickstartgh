"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { ProgressStepper } from "@/components/onboarding/ProgressStepper";
import { fadeInUp } from "@/lib/motion";

const stepLabels = ["Role", "Team", "Staff", "Invite"];

type OnboardingLayoutProps = {
  step?: number;
  backHref?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

function OnboardingLayout({ step, backHref, title, description, children }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 items-center gap-3 border-b border-border px-4 lg:px-8">
        {backHref ? (
          <Link
            href={backHref}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </Link>
        ) : (
          <div className="size-8" />
        )}
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            K
          </div>
          <span className="font-heading text-sm font-semibold text-foreground">KickStartGH</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6 lg:py-10">
        {typeof step === "number" && <ProgressStepper steps={stepLabels} currentStep={step} />}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>

          {children}
        </motion.div>
      </main>
    </div>
  );
}

export { OnboardingLayout };

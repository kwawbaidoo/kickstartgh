"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";

import { SuccessCard } from "@/components/onboarding/SuccessCard";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const draft = useOnboardingStore((state) => state.draft);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  function handleFinish(destination: "/dashboard" | "/players") {
    completeOnboarding();
    router.push(destination);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex w-full max-w-sm flex-col items-center gap-6"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <PartyPopper className="size-8" />
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Your team is now ready.
          </h1>
          <p className="text-sm text-muted-foreground">
            {draft.team.name ?? "Your team"} is set up and ready to go.
          </p>
        </div>

        <SuccessCard team={draft.team} staff={draft.staff} />

        <div className="flex w-full flex-col gap-2">
          <Button size="lg" className="w-full" onClick={() => handleFinish("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => handleFinish("/players")}
          >
            Add Players
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

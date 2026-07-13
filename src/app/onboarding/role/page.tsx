"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { RoleCard } from "@/components/onboarding/RoleCard";
import { Stagger } from "@/components/common/Stagger";
import { Button } from "@/components/ui/button";
import { roleOptions, type RoleId } from "@/config/roles";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function RoleSelectionPage() {
  const router = useRouter();
  const storedRole = useOnboardingStore((state) => state.draft.role);
  const setRole = useOnboardingStore((state) => state.setRole);
  const [selected, setSelected] = useState<RoleId>(storedRole ?? "teamManager");

  function handleContinue() {
    setRole(selected);
    router.push("/onboarding/team");
  }

  return (
    <OnboardingLayout
      step={0}
      backHref="/onboarding"
      title="What's your role?"
      description="This helps us tailor KickStartGH to what you need."
    >
      <Stagger className="flex flex-col gap-3">
        {roleOptions.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selected === role.id}
            onSelect={() => setSelected(role.id)}
          />
        ))}
      </Stagger>

      <Button size="lg" className="w-full" onClick={handleContinue}>
        Continue
      </Button>
    </OnboardingLayout>
  );
}

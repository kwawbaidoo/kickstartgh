"use client";

import { useOnboardingStore } from "@/store/onboarding-store";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function DashboardGreeting() {
  const teamName = useOnboardingStore((state) => state.activeTeam.name);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {getGreeting()}, Coach 👋
      </h1>
      <p className="text-sm text-muted-foreground">Welcome back to {teamName}</p>
    </div>
  );
}

export { DashboardGreeting };

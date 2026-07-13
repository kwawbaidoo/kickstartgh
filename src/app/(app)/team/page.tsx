import { Shield } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Team" description="Manage your team profile and staff." />
      <EmptyState
        icon={Shield}
        title="Your team profile isn't set up yet."
        description="Add your team name, home ground, and coaching staff to get started."
        actionLabel="Set up your team"
        actionHref="/onboarding"
      />
    </div>
  );
}

import { Settings as SettingsIcon } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Settings" description="Team preferences and account settings." />
      <EmptyState
        icon={SettingsIcon}
        title="Settings are on the way."
        description="Team roles, notifications, and preferences will live here."
      />
    </div>
  );
}

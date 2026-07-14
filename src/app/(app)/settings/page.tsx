"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { settingsNavItems } from "@/config/settings";
import { roleOptions } from "@/config/roles";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useSettingsStore } from "@/store/settings-store";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const preferredRole = useSettingsStore((state) => state.profile.preferredRole);
  const roleLabel = roleOptions.find((option) => option.id === preferredRole)?.label ?? "Team Member";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Settings" description="Team preferences and account settings." />

      <Card>
        <CardContent className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-semibold text-primary-foreground">
            {activeTeam.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeTeam.logo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(activeTeam.name)
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold text-foreground">{activeTeam.name}</span>
            <span className="text-sm text-muted-foreground">Role: {roleLabel}</span>
          </div>
        </CardContent>
      </Card>

      <SettingsSection>
        {settingsNavItems.map((item) => (
          <SettingsCard key={item.href} {...item} />
        ))}
      </SettingsSection>
    </div>
  );
}

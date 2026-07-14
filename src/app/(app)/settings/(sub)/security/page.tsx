"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { SecurityCard } from "@/components/settings/SecurityCard";
import { useSettingsStore } from "@/store/settings-store";

export default function SecuritySettingsPage() {
  const security = useSettingsStore((state) => state.security);
  const toggleTwoFactor = useSettingsStore((state) => state.toggleTwoFactor);
  const logOutSession = useSettingsStore((state) => state.logOutSession);
  const logOutAllOtherSessions = useSettingsStore((state) => state.logOutAllOtherSessions);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Security" description="Keep your account and team data safe." />
      <SecurityCard
        lastLogin={security.lastLogin}
        twoFactorEnabled={security.twoFactorEnabled}
        sessions={security.sessions}
        onToggleTwoFactor={toggleTwoFactor}
        onLogOutSession={logOutSession}
        onLogOutAllOtherSessions={logOutAllOtherSessions}
        onChangePassword={() => {}}
      />
    </div>
  );
}

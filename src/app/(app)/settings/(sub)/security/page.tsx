"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { SecurityCard } from "@/components/settings/SecurityCard";
import { useSettingsStore } from "@/store/settings-store";

export default function SecuritySettingsPage() {
  const security = useSettingsStore((state) => state.security);
  const toggleTwoFactor = useSettingsStore((state) => state.toggleTwoFactor);
  const logOutSession = useSettingsStore((state) => state.logOutSession);
  const logOutAllOtherSessions = useSettingsStore((state) => state.logOutAllOtherSessions);
  const changePassword = useSettingsStore((state) => state.changePassword);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);
  const isLoading = useSettingsStore((state) => state.isLoading);

  if (!hasHydrated || isLoading) {
    return <LoadingSkeleton className="h-64 w-full" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Security" description="Keep your account and team data safe." />
      <SecurityCard
        last_login={security.last_login}
        two_factor_enabled={security.two_factor_enabled}
        sessions={security.sessions}
        onToggleTwoFactor={toggleTwoFactor}
        onLogOutSession={logOutSession}
        onLogOutAllOtherSessions={logOutAllOtherSessions}
        onChangePassword={changePassword}
      />
    </div>
  );
}

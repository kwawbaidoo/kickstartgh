"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { useSettingsStore } from "@/store/settings-store";

export default function NotificationsSettingsPage() {
  const notifications = useSettingsStore((state) => state.notifications);
  const setNotificationChannel = useSettingsStore((state) => state.setNotificationChannel);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const [error, setError] = useState<string | null>(null);

  if (!hasHydrated || isLoading) {
    return <LoadingSkeleton className="h-64 w-full" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Notifications"
        description="Choose how and when your team hears from KickStartGH."
      />
      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <NotificationSettings
        value={notifications}
        onChange={(type, channel, value) => {
          setError(null);
          setNotificationChannel(type, channel, value).catch(() =>
            setError("Couldn't save that notification setting. Please try again.")
          );
        }}
      />
    </div>
  );
}

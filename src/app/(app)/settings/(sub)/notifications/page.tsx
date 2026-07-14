"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { useSettingsStore } from "@/store/settings-store";

export default function NotificationsSettingsPage() {
  const notifications = useSettingsStore((state) => state.notifications);
  const setNotificationChannel = useSettingsStore((state) => state.setNotificationChannel);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Notifications"
        description="Choose how and when your team hears from KickStartGH."
      />
      <NotificationSettings value={notifications} onChange={setNotificationChannel} />
    </div>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  notificationChannelConfig,
  notificationTypeConfig,
  type NotificationChannel,
  type NotificationType,
} from "@/config/settings";
import type { NotificationSettings as NotificationSettingsValue } from "@/store/settings-store";

const channels: NotificationChannel[] = ["inApp", "whatsapp", "email", "sms"];
const types: NotificationType[] = ["matchReminders", "trainingReminders", "teamAnnouncements", "reportNotifications"];

type NotificationSettingsProps = {
  value: NotificationSettingsValue;
  onChange: (type: NotificationType, channel: NotificationChannel, value: boolean) => void;
};

function NotificationSettings({ value, onChange }: NotificationSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      {types.map((type) => {
        const config = notificationTypeConfig[type];
        const Icon = config.icon;
        return (
          <Card key={type}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{config.label}</span>
                  <span className="text-xs text-muted-foreground">{config.description}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pl-12">
                {channels.map((channel) => {
                  const channelConfig = notificationChannelConfig[channel];
                  return (
                    <div key={channel} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        {channelConfig.label}
                        {channelConfig.future && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Coming soon
                          </span>
                        )}
                      </span>
                      <Switch
                        checked={value[type][channel]}
                        disabled={channelConfig.future}
                        onCheckedChange={(checked) => onChange(type, channel, checked)}
                        aria-label={`${config.label} via ${channelConfig.label}`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { NotificationSettings };

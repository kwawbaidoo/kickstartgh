import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { RoleId } from "@/config/roles";
import type {
  DateFormatOption,
  LanguageOption,
  NotificationChannel,
  NotificationType,
  ThemeOption,
} from "@/config/settings";
import type { ProfileFormInput } from "@/schemas/settings";

export type Profile = {
  fullName: string;
  phone: string;
  email: string;
  photo?: string;
  preferredRole: RoleId;
  dateJoined: string;
};

export type Preferences = {
  theme: ThemeOption;
  language: LanguageOption;
  dateFormat: DateFormatOption;
  defaultHomeScreen: string;
  favoriteShortcuts: string[];
};

export type NotificationSettings = Record<NotificationType, Record<NotificationChannel, boolean>>;

export type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
};

export type SecuritySettings = {
  lastLogin: string;
  twoFactorEnabled: boolean;
  sessions: Session[];
};

type SettingsState = {
  profile: Profile;
  preferences: Preferences;
  notifications: NotificationSettings;
  security: SecuritySettings;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  updateProfile: (input: ProfileFormInput) => void;
  updatePreferences: (input: Partial<Preferences>) => void;
  toggleFavoriteShortcut: (href: string) => void;
  setNotificationChannel: (type: NotificationType, channel: NotificationChannel, value: boolean) => void;
  toggleTwoFactor: () => void;
  logOutSession: (id: string) => void;
  logOutAllOtherSessions: () => void;
};

const defaultNotifications: NotificationSettings = {
  matchReminders: { inApp: true, whatsapp: true, email: false, sms: false },
  trainingReminders: { inApp: true, whatsapp: true, email: false, sms: false },
  teamAnnouncements: { inApp: true, whatsapp: false, email: false, sms: false },
  reportNotifications: { inApp: true, whatsapp: false, email: true, sms: false },
};

const defaultSessions: Session[] = [
  { id: "session_1", device: "iPhone 13 · Safari", location: "Accra, Ghana", lastActive: "Active now", current: true },
  { id: "session_2", device: "Samsung A14 · Chrome", location: "Takoradi, Ghana", lastActive: "2 days ago" },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: {
        fullName: "Kojo Boateng",
        phone: "+233 24 000 0000",
        email: "kojo.boateng@example.com",
        preferredRole: "headCoach",
        dateJoined: "2024-02-01T00:00:00.000Z",
      },
      preferences: {
        theme: "system",
        language: "en",
        dateFormat: "DD/MM/YYYY",
        defaultHomeScreen: "/dashboard",
        favoriteShortcuts: ["/players/new", "/matches/new"],
      },
      notifications: defaultNotifications,
      security: {
        lastLogin: "2026-07-13T14:32:00.000Z",
        twoFactorEnabled: false,
        sessions: defaultSessions,
      },
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      updateProfile: (input) =>
        set((state) => ({ profile: { ...state.profile, ...input, email: input.email ?? "" } })),

      updatePreferences: (input) =>
        set((state) => ({ preferences: { ...state.preferences, ...input } })),

      toggleFavoriteShortcut: (href) =>
        set((state) => {
          const has = state.preferences.favoriteShortcuts.includes(href);
          return {
            preferences: {
              ...state.preferences,
              favoriteShortcuts: has
                ? state.preferences.favoriteShortcuts.filter((item) => item !== href)
                : [...state.preferences.favoriteShortcuts, href],
            },
          };
        }),

      setNotificationChannel: (type, channel, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [type]: { ...state.notifications[type], [channel]: value },
          },
        })),

      toggleTwoFactor: () =>
        set((state) => ({
          security: { ...state.security, twoFactorEnabled: !state.security.twoFactorEnabled },
        })),

      logOutSession: (id) =>
        set((state) => ({
          security: {
            ...state.security,
            sessions: state.security.sessions.filter((session) => session.id !== id),
          },
        })),

      logOutAllOtherSessions: () =>
        set((state) => ({
          security: {
            ...state.security,
            sessions: state.security.sessions.filter((session) => session.current),
          },
        })),
    }),
    {
      name: "kickstartgh-settings",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

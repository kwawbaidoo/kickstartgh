import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { formatDistanceToNow } from "date-fns";

import type {
  DateFormatOption,
  LanguageOption,
  NotificationChannel,
  NotificationType,
  ThemeOption,
} from "@/config/settings";
import type { ChangePasswordInput } from "@/schemas/settings";
import { apiFetch } from "@/lib/api-client";

export type Preferences = {
  theme: ThemeOption;
  language: LanguageOption;
  date_format: DateFormatOption;
  default_home_screen: string;
  favorite_shortcuts: string[];
};

export type NotificationSettings = Record<NotificationType, Record<NotificationChannel, boolean>>;

export type Session = {
  id: string;
  device: string;
  location: string;
  last_active: string;
  current?: boolean;
};

export type SecuritySettings = {
  last_login: string;
  two_factor_enabled: boolean;
  sessions: Session[];
};

type SettingsState = {
  preferences: Preferences;
  notifications: NotificationSettings;
  security: SecuritySettings;
  hasHydrated: boolean;
  isLoading: boolean;
  setHasHydrated: (value: boolean) => void;
  fetchPreferences: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchSecurity: () => Promise<void>;
  updatePreferences: (input: Partial<Preferences>) => Promise<void>;
  toggleFavoriteShortcut: (href: string) => Promise<void>;
  setNotificationChannel: (type: NotificationType, channel: NotificationChannel, value: boolean) => Promise<void>;
  toggleTwoFactor: () => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  logOutSession: (id: string) => Promise<void>;
  logOutAllOtherSessions: () => Promise<void>;
};

/**
 * Confirmed live 2026-08-15 (Get/Update Profile, Preferences, Notifications, Security,
 * Change Password, Toggle 2FA, Logout One/All-Other Sessions all called directly against
 * the real server) — response `data` payloads are camelCase, same as every other domain.
 *
 * Big finding: `GET /me/profile` returns the exact same shape as `GET /me` — there's no
 * separate "profile" concept server-side. The old mock `settings-store.profile` (and
 * `security.two_factor_enabled`/`last_login`, which likewise duplicate
 * `AuthUser.two_factor_enabled`/`last_login_at`) were 100% hardcoded fake data with zero
 * sync to the real signed-in user. Profile reading/writing now lives on `auth-store.ts`
 * (`updateProfile`, sharing the same `user` state `login`/`fetchCurrentUser` already
 * populate) — this store no longer has a `profile` field at all.
 *
 * `PATCH /me/preferences` and `PATCH /me/notifications` are genuine partial-merge PATCHes
 * (confirmed: sending just `{"theme":"dark"}` preserves every other field, and
 * `{"matchReminders":{"whatsapp":false}}` only touches that one type+channel) — matches
 * what the UI already did before this sprint (`updatePreferences`/`setNotificationChannel`
 * were already called with single-field payloads). `/me/notifications`'s keys are
 * genuinely camelCase in both directions (confirmed, not a typo — resolves
 * INTEGRATION_PLAN.md §4 Q1).
 *
 * `GET /me/security`'s `sessions[]` are literally Sanctum personal access tokens
 * (`DELETE .../sessions/:token_id`, not a separate "device" resource) — `device` is
 * whatever raw token name the backend set (e.g. `"api-fCiRCOUG"`), `location` is always
 * `null` (no IP geolocation happens), and `lastActive` is a raw ISO timestamp or `null`
 * (never used again). The mock's "iPhone 13 · Safari" / "Accra, Ghana" style device/
 * location strings were pure fiction with no backend equivalent — displayed as-is now,
 * not embellished. Confirmed live that `POST /me/security/2fa/toggle` really does
 * persist the flag, but logging back in with `twoFactorEnabled: true` set required no
 * OTP/second factor at all — this remains Gap G6 (a real, persisted flag with no actual
 * enforcement), so the toggle is wired for real but still cosmetic.
 */
type PreferencesResponse = {
  theme: ThemeOption | null;
  language: LanguageOption | null;
  dateFormat: DateFormatOption | null;
  defaultHomeScreen: string | null;
  favoriteShortcuts: string[];
};

type SessionResponse = {
  id: string;
  device: string;
  location: string | null;
  lastActive: string | null;
  current: boolean;
};

type SecurityResponse = {
  lastLogin: string;
  twoFactorEnabled: boolean;
  sessions: SessionResponse[];
};

function mapPreferences(response: PreferencesResponse): Preferences {
  return {
    theme: response.theme ?? "system",
    language: response.language ?? "en",
    date_format: response.dateFormat ?? "DD/MM/YYYY",
    default_home_screen: response.defaultHomeScreen ?? "/dashboard",
    favorite_shortcuts: response.favoriteShortcuts,
  };
}

function formatLastActive(iso: string | null, current: boolean): string {
  if (current) return "Active now";
  if (!iso) return "Never used";
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

function mapSession(response: SessionResponse): Session {
  return {
    id: response.id,
    device: response.device,
    location: response.location ?? "Unknown location",
    last_active: formatLastActive(response.lastActive, response.current),
    current: response.current || undefined,
  };
}

function mapSecurity(response: SecurityResponse): SecuritySettings {
  return {
    last_login: response.lastLogin,
    two_factor_enabled: response.twoFactorEnabled,
    sessions: response.sessions.map(mapSession),
  };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      preferences: {
        theme: "system",
        language: "en",
        date_format: "DD/MM/YYYY",
        default_home_screen: "/dashboard",
        favorite_shortcuts: [],
      },
      notifications: {
        matchReminders: { inApp: true, whatsapp: true, email: false, sms: false },
        trainingReminders: { inApp: true, whatsapp: true, email: false, sms: false },
        teamAnnouncements: { inApp: true, whatsapp: false, email: false, sms: false },
        reportNotifications: { inApp: true, whatsapp: false, email: true, sms: false },
      },
      security: { last_login: "", two_factor_enabled: false, sessions: [] },
      hasHydrated: false,
      isLoading: true,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchPreferences: async () => {
        const response = await apiFetch<PreferencesResponse>("/me/preferences");
        set({ preferences: mapPreferences(response) });
      },

      fetchNotifications: async () => {
        const response = await apiFetch<NotificationSettings>("/me/notifications");
        set({ notifications: response });
      },

      fetchSecurity: async () => {
        const response = await apiFetch<SecurityResponse>("/me/security");
        set({ security: mapSecurity(response) });
      },

      updatePreferences: async (input) => {
        const response = await apiFetch<PreferencesResponse>("/me/preferences", {
          method: "PATCH",
          body: input,
        });
        set({ preferences: mapPreferences(response) });
      },

      toggleFavoriteShortcut: async (href) => {
        const current = get().preferences.favorite_shortcuts;
        const next = current.includes(href) ? current.filter((item) => item !== href) : [...current, href];
        await get().updatePreferences({ favorite_shortcuts: next });
      },

      setNotificationChannel: async (type, channel, value) => {
        const response = await apiFetch<NotificationSettings>("/me/notifications", {
          method: "PATCH",
          body: { [type]: { [channel]: value } },
        });
        set({ notifications: response });
      },

      toggleTwoFactor: async () => {
        const response = await apiFetch<{ twoFactorEnabled: boolean }>("/me/security/2fa/toggle", {
          method: "POST",
        });
        set((state) => ({ security: { ...state.security, two_factor_enabled: response.twoFactorEnabled } }));
      },

      changePassword: async (input) => {
        await apiFetch<void>("/me/security/password", {
          method: "POST",
          body: {
            current_password: input.current_password,
            new_password: input.new_password,
            new_password_confirmation: input.confirm_password,
          },
        });
      },

      logOutSession: async (id) => {
        await apiFetch<void>(`/me/security/sessions/${id}`, { method: "DELETE" });
        set((state) => ({
          security: {
            ...state.security,
            sessions: state.security.sessions.filter((session) => session.id !== id),
          },
        }));
      },

      logOutAllOtherSessions: async () => {
        await apiFetch<void>("/me/security/sessions", { method: "DELETE" });
        set((state) => ({
          security: { ...state.security, sessions: state.security.sessions.filter((session) => session.current) },
        }));
      },
    }),
    {
      name: "kickstartgh-settings-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        preferences: state.preferences,
        notifications: state.notifications,
        security: state.security,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

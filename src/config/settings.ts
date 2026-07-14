import {
  Bell,
  CalendarDays,
  Download,
  Info,
  Settings as SettingsIcon,
  Shield,
  Sliders,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SettingsNavItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const settingsNavItems: SettingsNavItem[] = [
  {
    label: "My Profile",
    description: "Name, contact details, and preferred role.",
    href: "/settings/profile",
    icon: User,
  },
  {
    label: "Team Settings",
    description: "Team identity, colors, and social links.",
    href: "/settings/team",
    icon: SettingsIcon,
  },
  {
    label: "Staff & Roles",
    description: "Manage coaches, managers, and permissions.",
    href: "/settings/staff",
    icon: Users,
  },
  {
    label: "Preferences",
    description: "Theme, language, and dashboard defaults.",
    href: "/settings/preferences",
    icon: Sliders,
  },
  {
    label: "Notifications",
    description: "Match, training, and report reminders.",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    label: "Security",
    description: "Password, two-factor authentication, sessions.",
    href: "/settings/security",
    icon: Shield,
  },
  {
    label: "Data & Export",
    description: "Export players, matches, and reports.",
    href: "/settings/export",
    icon: Download,
  },
  {
    label: "About",
    description: "App version, support, and legal.",
    href: "/settings/about",
    icon: Info,
  },
];

export const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export type ThemeOption = (typeof themeOptions)[number]["value"];

export const languageOptions = [
  { value: "en", label: "English", disabled: false },
  { value: "tw", label: "Twi (coming soon)", disabled: true },
  { value: "fa", label: "Fante (coming soon)", disabled: true },
] as const;

export type LanguageOption = (typeof languageOptions)[number]["value"];

export const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
] as const;

export type DateFormatOption = (typeof dateFormatOptions)[number]["value"];

export const defaultHomeScreenOptions = [
  { value: "/dashboard", label: "Dashboard" },
  { value: "/players", label: "Players" },
  { value: "/matches", label: "Matches" },
  { value: "/training", label: "Training" },
  { value: "/reports", label: "Reports" },
] as const;

export const favoriteShortcutOptions = [
  { value: "/players/new", label: "Add Player" },
  { value: "/matches/new", label: "Create Match" },
  { value: "/training/new", label: "Schedule Training" },
  { value: "/reports", label: "Generate Report" },
  { value: "/training/calendar", label: "Training Calendar" },
] as const;

export type NotificationType = "matchReminders" | "trainingReminders" | "teamAnnouncements" | "reportNotifications";

export type NotificationChannel = "inApp" | "whatsapp" | "email" | "sms";

export const notificationTypeConfig: Record<
  NotificationType,
  { label: string; description: string; icon: LucideIcon }
> = {
  matchReminders: {
    label: "Match Reminders",
    description: "Notify coaches after match results.",
    icon: CalendarDays,
  },
  trainingReminders: {
    label: "Training Reminders",
    description: "Notify players 1 hour before training.",
    icon: Bell,
  },
  teamAnnouncements: {
    label: "Team Announcements",
    description: "General updates shared with the team.",
    icon: Users,
  },
  reportNotifications: {
    label: "Report Notifications",
    description: "Get notified when a new report is ready.",
    icon: Info,
  },
};

export const notificationChannelConfig: Record<
  NotificationChannel,
  { label: string; future?: boolean }
> = {
  inApp: { label: "In-app" },
  whatsapp: { label: "WhatsApp" },
  email: { label: "Email" },
  sms: { label: "SMS", future: true },
};

export type ExportDataType = "players" | "team" | "matches" | "reports" | "attendance";

export const exportDataTypeLabels: Record<ExportDataType, string> = {
  players: "Players",
  team: "Team Information",
  matches: "Matches",
  reports: "Reports",
  attendance: "Attendance",
};

export type PermissionAction =
  | "Add Player"
  | "Create Match"
  | "Generate Reports"
  | "Edit Team"
  | "Manage Staff"
  | "Take Attendance";

export const permissionRoles = ["Manager", "Coach", "Captain", "Player"] as const;

export const permissionMatrix: { action: PermissionAction; allowed: Record<(typeof permissionRoles)[number], boolean> }[] = [
  { action: "Add Player", allowed: { Manager: true, Coach: true, Captain: false, Player: false } },
  { action: "Create Match", allowed: { Manager: true, Coach: true, Captain: false, Player: false } },
  { action: "Generate Reports", allowed: { Manager: true, Coach: true, Captain: false, Player: false } },
  { action: "Edit Team", allowed: { Manager: true, Coach: false, Captain: false, Player: false } },
  { action: "Manage Staff", allowed: { Manager: true, Coach: false, Captain: false, Player: false } },
  { action: "Take Attendance", allowed: { Manager: true, Coach: true, Captain: true, Player: false } },
];

export const appInfo = {
  version: "1.0.0",
  releaseNotes: [
    { version: "1.0.0", date: "2026-07-13", notes: "Training & attendance management." },
    { version: "0.5.0", date: "2026-06-20", notes: "Reporting & analytics engine." },
    { version: "0.4.0", date: "2026-06-01", notes: "Match management & live event recording." },
  ],
  supportPhone: "+233 24 000 0000",
  supportEmail: "support@kickstartgh.app",
};

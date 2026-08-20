import {
  LayoutDashboard,
  Shield,
  Users,
  CalendarDays,
  ClipboardCheck,
  FileBarChart,
  Settings,
  Home,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * Every destination except Settings reads team-scoped data, so all of them are hidden
   * while the signed-in user has no team — there is nothing for them to show but errors
   * and empty states. Settings (profile, preferences, security) is entirely personal.
   */
  requiresTeam?: boolean;
};

export const sidebarNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiresTeam: true },
  { label: "Seasons", href: "/seasons", icon: Trophy, requiresTeam: true },
  { label: "Team", href: "/team", icon: Shield, requiresTeam: true },
  { label: "Players", href: "/players", icon: Users, requiresTeam: true },
  { label: "Matches", href: "/matches", icon: CalendarDays, requiresTeam: true },
  { label: "Attendance", href: "/training", icon: ClipboardCheck, requiresTeam: true },
  { label: "Reports", href: "/reports", icon: FileBarChart, requiresTeam: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const mobileNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, requiresTeam: true },
  { label: "Matches", href: "/matches", icon: CalendarDays, requiresTeam: true },
  { label: "Players", href: "/players", icon: Users, requiresTeam: true },
  { label: "Reports", href: "/reports", icon: FileBarChart, requiresTeam: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Route prefixes that work without a team. Kept as a list rather than derived from the nav
 * items because it also has to cover sub-routes the nav never links to directly
 * (`/settings/profile`, `/settings/security`, ...).
 */
export const teamFreePathPrefixes = ["/settings"];

export function pathRequiresTeam(pathname: string): boolean {
  return !teamFreePathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function navItemsForTeamState(items: NavItem[], hasTeam: boolean): NavItem[] {
  return hasTeam ? items : items.filter((item) => !item.requiresTeam);
}

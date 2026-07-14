import {
  LayoutDashboard,
  Shield,
  Users,
  CalendarDays,
  ClipboardCheck,
  FileBarChart,
  Settings,
  Home,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const sidebarNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Team", href: "/team", icon: Shield },
  { label: "Players", href: "/players", icon: Users },
  { label: "Matches", href: "/matches", icon: CalendarDays },
  { label: "Attendance", href: "/training", icon: ClipboardCheck },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const mobileNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Matches", href: "/matches", icon: CalendarDays },
  { label: "Players", href: "/players", icon: Users },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

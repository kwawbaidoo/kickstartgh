import { Award, Briefcase, Megaphone, UserCog, UserRound, type LucideIcon } from "lucide-react";

export const roleIds = ["teamManager", "headCoach", "assistantCoach", "captain"] as const;

export type RoleId = (typeof roleIds)[number];

export type RoleOption = {
  id: RoleId;
  label: string;
  description: string;
  icon: LucideIcon;
  recommended?: boolean;
};

export const roleOptions: RoleOption[] = [
  {
    id: "teamManager",
    label: "Team Manager",
    description: "Runs the team day-to-day: players, staff, and reports.",
    icon: Briefcase,
    recommended: true,
  },
  {
    id: "headCoach",
    label: "Head Coach",
    description: "Picks the squad and records match results.",
    icon: Megaphone,
  },
  {
    id: "assistantCoach",
    label: "Assistant Coach",
    description: "Supports training and match-day duties.",
    icon: UserCog,
  },
  {
    id: "captain",
    label: "Team Captain",
    description: "Leads the squad on and off the pitch.",
    icon: Award,
  },
];

/**
 * Metadata for the four built-in roles, keyed by id.
 *
 * Staff roles are **not** limited to these — a team can type any role they like when
 * adding staff (physio, kit manager, welfare officer), so a staff member's `role` is a
 * plain string, not a `RoleId`. These four are suggestions and the only ones with an icon,
 * a description and a row in the permissions table. Always go through the accessors below
 * rather than indexing this directly: a custom role isn't a key here, and
 * `staffRoleMeta[role].icon` on one crashes.
 */
export const staffRoleMeta: Record<RoleId, RoleOption> = Object.fromEntries(
  roleOptions.map((option) => [option.id, option])
) as Record<RoleId, RoleOption>;

/** Suggested roles, in display order. Not an allow-list. */
export const staffRoleOptions: { value: RoleId; label: string }[] = [
  { value: "headCoach", label: "Head Coach" },
  { value: "assistantCoach", label: "Assistant Coach" },
  { value: "teamManager", label: "Team Manager" },
  { value: "captain", label: "Captain" },
];

export function isBuiltInStaffRole(role: string): role is RoleId {
  return staffRoleOptions.some((option) => option.value === role);
}

/**
 * Built-in roles are stored as camelCase ids and need looking up; a custom role is stored
 * as the words the user typed, so it is already its own label.
 */
export function staffRoleLabel(role: string): string {
  if (!role) return "Staff";
  return staffRoleOptions.find((option) => option.value === role)?.label ?? role;
}

export function staffRoleIcon(role: string): LucideIcon {
  return isBuiltInStaffRole(role) ? staffRoleMeta[role].icon : UserRound;
}

export function staffRoleDescription(role: string): string {
  return isBuiltInStaffRole(role) ? staffRoleMeta[role].description : "";
}

/**
 * Custom roles a team already uses, so they can be picked again instead of retyped (and
 * spelled three different ways). Built-ins are excluded — they're always offered anyway.
 */
export function customRolesInUse(roles: string[]): string[] {
  const seen = new Map<string, string>();
  for (const role of roles) {
    const trimmed = role.trim();
    if (!trimmed || isBuiltInStaffRole(trimmed)) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/**
 * Roles that count as "owns the team" for the purposes of the onboarding gate: signing in
 * with one of these and no team yet sends you to create one, rather than to the
 * "ask your team owner" screen.
 *
 * Provisioning is expected to set `preferred_role` when the account is created. Note the
 * hole this leaves: `preferred_role` is a *self-declared preference* editable from
 * Settings → Profile, so a coach could promote themselves into the team-creation flow.
 * `resolveIsTeamOwner` in auth-store.ts prefers a real server flag whenever one exists.
 * See BACKEND_GAPS.md §9.1.
 */
export const ownerRoleIds: RoleId[] = ["teamManager"];

export function isOwnerRole(role: string | null | undefined): boolean {
  return !!role && (ownerRoleIds as string[]).includes(role);
}

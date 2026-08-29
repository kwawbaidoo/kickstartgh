import { MailCheck, ShieldCheck, ShieldOff, type LucideIcon } from "lucide-react";

import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

/**
 * Whether a staff member can sign in to KickStartGH — deliberately separate from their
 * role. Adding someone as staff only records them on the team; system access is granted
 * by explicitly inviting them, so a team can track kit managers, physios and volunteers
 * who never log in.
 *
 * `access_status` is NOT backed by the API today — staff records come back with only
 * `isActive` (see BACKEND_GAPS.md §7.3). It lives in the onboarding store and is
 * therefore per-device until the backend exposes it. `mapStaffMember` already reads an
 * optional `accessStatus` field so it switches over the moment one exists.
 */
export const staffAccessStatuses = ["no_access", "invited", "active"] as const;

export type StaffAccessStatus = (typeof staffAccessStatuses)[number];

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export type StaffAccessMeta = {
  label: string;
  /** Shown in the invite dialog and on the row's tooltip-style helper text. */
  description: string;
  tone: BadgeTone;
  icon: LucideIcon;
};

export const staffAccessMeta: Record<StaffAccessStatus, StaffAccessMeta> = {
  no_access: {
    label: "No access",
    description: "On the team, but can't sign in to the system.",
    tone: "neutral",
    icon: ShieldOff,
  },
  invited: {
    label: "Invited",
    description: "Invite sent — waiting for them to set their password.",
    tone: "warning",
    icon: MailCheck,
  },
  active: {
    label: "Has access",
    description: "Can sign in and use the system.",
    tone: "success",
    icon: ShieldCheck,
  },
};

/** How an invite gets delivered. Both are sent server-side; the frontend only picks one. */
export const inviteChannels = ["email", "sms"] as const;

export type InviteChannel = (typeof inviteChannels)[number];

export const inviteChannelLabels: Record<InviteChannel, string> = {
  email: "Email",
  sms: "SMS",
};

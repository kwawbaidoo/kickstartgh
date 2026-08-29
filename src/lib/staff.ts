import { staffRoleLabel } from "@/config/roles";
import { inviteChannelLabels, type InviteChannel } from "@/config/staff-access";
import type { StaffMember } from "@/schemas/onboarding";

/**
 * Ghanaian numbers are entered locally ("024 123 4567") but `wa.me` and `sms:` links need
 * them unspaced, and WhatsApp needs the country code. A number already in international
 * form (leading `+` or `233`) is left alone.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  return digits;
}

export function buildStaffInviteMessage(
  member: StaffMember,
  teamName: string,
  inviteUrl: string
): string {
  return [
    `Hi ${member.full_name},`,
    "",
    `You've been given access to ${teamName} on KickStartGH as ${staffRoleLabel(member.role)}.`,
    "",
    "Set up your account here:",
    inviteUrl,
    "",
    "You'll be asked to choose your own password the first time you sign in.",
  ].join("\n");
}

/**
 * Hand-delivery fallbacks. The invite endpoint doesn't send anything itself yet
 * (BACKEND_GAPS.md §7.2), so the UI offers the manager these instead of pretending an
 * email or text went out. All three open the user's own mail/SMS/WhatsApp client.
 */
export function buildInviteShareHref(
  channel: InviteChannel,
  member: StaffMember,
  teamName: string,
  inviteUrl: string,
  phone: string
): string {
  const message = buildStaffInviteMessage(member, teamName, inviteUrl);

  if (channel === "email") {
    const subject = `Your ${teamName} access on KickStartGH`;
    return `mailto:${member.email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  return `sms:${normalizePhone(phone)}?&body=${encodeURIComponent(message)}`;
}

export function buildInviteWhatsAppHref(
  member: StaffMember,
  teamName: string,
  inviteUrl: string,
  phone: string
): string {
  const message = buildStaffInviteMessage(member, teamName, inviteUrl);
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function inviteChannelLabel(channel: InviteChannel): string {
  return inviteChannelLabels[channel];
}

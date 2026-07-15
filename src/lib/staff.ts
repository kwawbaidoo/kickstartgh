import { staffRoleOptions } from "@/config/roles";
import type { StaffMember } from "@/schemas/onboarding";

/**
 * Demo-only credential generator. There is no real auth backend behind this app,
 * so this never gets used to actually authenticate anyone — it exists purely so
 * the "new staff account" flow has something concrete to display and share.
 */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I characters
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function buildStaffCredentialsMessage(
  member: StaffMember,
  teamName: string,
  tempPassword: string
): string {
  const roleLabel = staffRoleOptions.find((option) => option.value === member.role)?.label ?? "Staff";

  return [
    "⚽ KickStartGH Staff Account",
    "",
    `Hi ${member.fullName},`,
    "",
    `You've been added as ${roleLabel} for ${teamName} on KickStartGH.`,
    "",
    "Your login details:",
    ...(member.email ? [`Email: ${member.email}`] : []),
    `Phone: ${member.phone}`,
    `Temporary password: ${tempPassword}`,
    "",
    "Please log in and change your password on first use.",
  ].join("\n");
}

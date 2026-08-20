import { z } from "zod";

import { inviteChannels, staffAccessStatuses } from "@/config/staff-access";

const currentYear = new Date().getFullYear();

export const teamDetailsSchema = z.object({
  name: z.string().min(2, "Please enter your team name."),
  nickname: z.string().trim().optional(),
  region: z.string().min(1, "Please select a region."),
  district: z.string().min(1, "Please enter a district."),
  home_ground: z.string().min(2, "Please enter your home ground."),
  year_established: z.coerce
    .number({ error: "Please enter a valid year." })
    .int("Please enter a valid year.")
    .min(1900, "Year must be 1900 or later.")
    .max(currentYear, `Year can't be later than ${currentYear}.`),
  logo: z.string().optional(),
  cover_image: z.string().optional(),
  color_primary: z.string().optional(),
  color_secondary: z.string().optional(),
  slogan: z
    .string()
    .max(120, "Keep your slogan under 120 characters.")
    .trim()
    .optional(),
  facebook: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  tiktok: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

export type TeamDetailsInput = z.infer<typeof teamDetailsSchema>;

/**
 * Free text, not an enum. Teams have roles the four built-ins don't cover (physio, kit
 * manager, welfare officer), so a role is whatever they type — `staffRoleOptions` are
 * suggestions. Built-ins are still stored as their camelCase ids, so a mixed list of
 * `"headCoach"` and `"Physio"` is expected; `staffRoleLabel` renders both.
 */
export const staffRoleSchema = z
  .string({ error: "Please choose or enter a role." })
  .trim()
  .min(2, "Please choose or enter a role.")
  .max(40, "Keep the role under 40 characters.");

export const staffFormSchema = z.object({
  role: staffRoleSchema,
  full_name: z.string().min(2, "Please enter a full name."),
  phone: z
    .string()
    .min(9, "Please enter a valid phone number.")
    .regex(/^[0-9+\s-]+$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email.").optional().or(z.literal("")),
});

export type StaffFormInput = z.infer<typeof staffFormSchema>;

/**
 * `access_status` and the `invite_*` fields are frontend-only state today — the API's
 * staff record has no equivalent (see BACKEND_GAPS.md §7.3), so they're optional here
 * and defaulted when mapping a response. Everything before them round-trips to the API.
 */
export type StaffMember = StaffFormInput & {
  id: string;
  access_status: (typeof staffAccessStatuses)[number];
  invited_at?: string;
  invite_channel?: (typeof inviteChannels)[number];
  invite_code?: string;
  invite_url?: string;
};

/**
 * Granting system access to an existing staff member. The channel drives which contact
 * detail is required — you can't email an invite to someone with no email on file, and
 * the phone is already mandatory on every staff record.
 */
export const staffInviteSchema = z
  .object({
    channel: z.enum(inviteChannels, { error: "Please choose how to send the invite." }),
    email: z.email("Please enter a valid email.").optional().or(z.literal("")),
    phone: z
      .string()
      .min(9, "Please enter a valid phone number.")
      .regex(/^[0-9+\s-]+$/, "Please enter a valid phone number."),
  })
  .refine((data) => data.channel !== "email" || !!data.email, {
    message: "An email address is required to send an email invite.",
    path: ["email"],
  });

export type StaffInviteInput = z.infer<typeof staffInviteSchema>;

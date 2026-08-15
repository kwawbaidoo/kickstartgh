import { z } from "zod";

import { roleIds } from "@/config/roles";

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

export const staffFormSchema = z.object({
  role: z.enum(roleIds, { error: "Please select a role." }),
  full_name: z.string().min(2, "Please enter a full name."),
  phone: z
    .string()
    .min(9, "Please enter a valid phone number.")
    .regex(/^[0-9+\s-]+$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email.").optional().or(z.literal("")),
});

export type StaffFormInput = z.infer<typeof staffFormSchema>;

export type StaffMember = StaffFormInput & { id: string };

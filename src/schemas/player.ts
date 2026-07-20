import { z } from "zod";

import { positionOptions, preferredFootOptions, statusOptions } from "@/config/players";
import type { Player, PlayerStatus, Position, PreferredFoot } from "@/mock/players";

const positionEnum = z.enum(positionOptions as [Position, ...Position[]], {
  error: "Please select a position.",
});
const preferredFootEnum = z.enum(preferredFootOptions as [PreferredFoot, ...PreferredFoot[]], {
  error: "Please select a preferred foot.",
});
const statusEnum = z.enum(statusOptions as [PlayerStatus, ...PlayerStatus[]], {
  error: "Please select a status.",
});

const emergencyContactFormSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.email("Please enter a valid email.").optional().or(z.literal("")),
});

const educationEntryFormSchema = z.object({
  institution: z.string().trim().min(1, "Please enter an institution name."),
  period: z.string().trim().min(1, "Please enter a period, e.g. 2019-2022."),
});

const socialLinksFormSchema = z.object({
  instagram: z.url("Please enter a valid URL.").optional().or(z.literal("")),
  twitter: z.url("Please enter a valid URL.").optional().or(z.literal("")),
  facebook: z.url("Please enter a valid URL.").optional().or(z.literal("")),
  tiktok: z.url("Please enter a valid URL.").optional().or(z.literal("")),
});

const marketabilityProfileFormSchema = z.object({
  nationality: z.string().trim().optional(),
  height: z.string().trim().optional(),
  education: z.array(educationEntryFormSchema).optional(),
  workExperience: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  otherSports: z.array(z.string()).optional(),
  socialLinks: socialLinksFormSchema.optional(),
});

const basePlayerFormSchema = z.object({
  fullName: z.string().min(2, "Please enter the player's full name."),
  nickname: z.string().trim().optional(),
  dateOfBirth: z
    .string()
    .min(1, "Please enter a date of birth.")
    .refine((value) => new Date(value) <= new Date(), "Date of birth can't be in the future."),
  photo: z.string().optional(),
  phone: z.string().trim().optional(),
  email: z.email("Please enter a valid email.").optional().or(z.literal("")),
  emergencyContact: emergencyContactFormSchema.optional(),
  jerseyNumber: z.coerce
    .number({ error: "Please enter a jersey number." })
    .int("Jersey number must be a whole number.")
    .min(1, "Jersey number must be between 1 and 99.")
    .max(99, "Jersey number must be between 1 and 99."),
  position: positionEnum,
  secondaryPosition: positionEnum.optional(),
  preferredFoot: preferredFootEnum,
  village: z.string().trim().optional(),
  previousClub: z.string().trim().optional(),
  status: statusEnum,
  profile: marketabilityProfileFormSchema.optional(),
});

export function createPlayerFormSchema(existingPlayers: Player[] = [], excludeId?: string) {
  return basePlayerFormSchema
    .refine(
      (data) => !data.secondaryPosition || data.secondaryPosition !== data.position,
      {
        message: "Secondary position should differ from the primary position.",
        path: ["secondaryPosition"],
      }
    )
    .refine(
      (data) =>
        !existingPlayers.some(
          (player) => player.id !== excludeId && player.jerseyNumber === data.jerseyNumber
        ),
      {
        message: "This jersey number is already taken.",
        path: ["jerseyNumber"],
      }
    );
}

export const playerFormSchema = basePlayerFormSchema;

export type PlayerFormInput = z.infer<typeof basePlayerFormSchema>;

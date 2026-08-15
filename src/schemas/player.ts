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

const basePlayerFormSchema = z.object({
  full_name: z.string().min(2, "Please enter the player's full name."),
  nickname: z.string().trim().optional(),
  date_of_birth: z
    .string()
    .min(1, "Please enter a date of birth.")
    .refine((value) => new Date(value) <= new Date(), "Date of birth can't be in the future."),
  photo: z.string().optional(),
  phone: z.string().trim().optional(),
  emergency_contact: z.string().trim().optional(),
  jersey_number: z.coerce
    .number({ error: "Please enter a jersey number." })
    .int("Jersey number must be a whole number.")
    .min(1, "Jersey number must be between 1 and 99.")
    .max(99, "Jersey number must be between 1 and 99."),
  position: positionEnum,
  secondary_position: positionEnum.optional(),
  preferred_foot: preferredFootEnum,
  village: z.string().trim().optional(),
  previous_club: z.string().trim().optional(),
  status: statusEnum,
});

export function createPlayerFormSchema(existingPlayers: Player[] = [], excludeId?: string) {
  return basePlayerFormSchema
    .refine(
      (data) => !data.secondary_position || data.secondary_position !== data.position,
      {
        message: "Secondary position should differ from the primary position.",
        path: ["secondary_position"],
      }
    )
    .refine(
      (data) =>
        !existingPlayers.some(
          (player) => player.id !== excludeId && player.jersey_number === data.jersey_number
        ),
      {
        message: "This jersey number is already taken.",
        path: ["jersey_number"],
      }
    );
}

export const playerFormSchema = basePlayerFormSchema;

export type PlayerFormInput = z.infer<typeof basePlayerFormSchema>;

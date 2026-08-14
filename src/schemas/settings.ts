import { z } from "zod";

import { roleIds } from "@/config/roles";
import { dateFormatOptions, defaultHomeScreenOptions, languageOptions, themeOptions } from "@/config/settings";

export const profileFormSchema = z.object({
  full_name: z.string().min(2, "Please enter a full name."),
  phone: z
    .string()
    .min(9, "Please enter a valid phone number.")
    .regex(/^[0-9+\s-]+$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email.").optional().or(z.literal("")),
  photo: z.string().optional(),
  preferred_role: z.enum(roleIds, { error: "Please select a role." }),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

const themeValues = themeOptions.map((option) => option.value) as [string, ...string[]];
const languageValues = languageOptions.map((option) => option.value) as [string, ...string[]];
const dateFormatValues = dateFormatOptions.map((option) => option.value) as [string, ...string[]];
const homeScreenValues = defaultHomeScreenOptions.map((option) => option.value) as [string, ...string[]];

export const preferencesFormSchema = z.object({
  theme: z.enum(themeValues),
  language: z.enum(languageValues),
  date_format: z.enum(dateFormatValues),
  default_home_screen: z.enum(homeScreenValues),
});

export type PreferencesFormInput = z.infer<typeof preferencesFormSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Please enter your current password."),
    new_password: z.string().min(8, "New password must be at least 8 characters."),
    confirm_password: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match.",
    path: ["confirm_password"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

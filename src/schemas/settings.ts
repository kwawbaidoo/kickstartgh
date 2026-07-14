import { z } from "zod";

import { roleIds } from "@/config/roles";
import { dateFormatOptions, defaultHomeScreenOptions, languageOptions, themeOptions } from "@/config/settings";

export const profileFormSchema = z.object({
  fullName: z.string().min(2, "Please enter a full name."),
  phone: z
    .string()
    .min(9, "Please enter a valid phone number.")
    .regex(/^[0-9+\s-]+$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email.").optional().or(z.literal("")),
  photo: z.string().optional(),
  preferredRole: z.enum(roleIds, { error: "Please select a role." }),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

const themeValues = themeOptions.map((option) => option.value) as [string, ...string[]];
const languageValues = languageOptions.map((option) => option.value) as [string, ...string[]];
const dateFormatValues = dateFormatOptions.map((option) => option.value) as [string, ...string[]];
const homeScreenValues = defaultHomeScreenOptions.map((option) => option.value) as [string, ...string[]];

export const preferencesFormSchema = z.object({
  theme: z.enum(themeValues),
  language: z.enum(languageValues),
  dateFormat: z.enum(dateFormatValues),
  defaultHomeScreen: z.enum(homeScreenValues),
});

export type PreferencesFormInput = z.infer<typeof preferencesFormSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

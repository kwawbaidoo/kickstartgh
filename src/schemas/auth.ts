import { z } from "zod";

const phoneSchema = z
  .string()
  .min(9, "Please enter a valid phone number.")
  .regex(/^[0-9+\s-]+$/, "Please enter a valid phone number.");

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Please enter your full name."),
    phone: phoneSchema,
    email: z.email("Please enter a valid email.").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string().min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match.",
    path: ["confirm_password"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * First sign-in with provisioned credentials. Accounts are created for owners and
 * invited staff rather than self-served, so the temporary password they were sent has to
 * be replaced before they reach the app. Maps onto `POST /me/security/password`, whose
 * `current_password` is the temporary one — prefilled from the sign-in that just
 * happened when it's still in memory, and asked for again after a page refresh.
 */
export const firstLoginPasswordSchema = z
  .object({
    current_password: z.string().min(1, "Please enter the password you were sent."),
    new_password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string().min(8, "Please confirm your new password."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match.",
    path: ["confirm_password"],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "Choose a password different from the temporary one.",
    path: ["new_password"],
  });

export type FirstLoginPasswordInput = z.infer<typeof firstLoginPasswordSchema>;

/**
 * "Request access" — there is no self-serve registration, so the landing page collects
 * the details the team needs to provision an account and hands them off (see
 * BACKEND_GAPS.md §7.4 for the endpoint this should POST to once it exists).
 */
export const accessRequestSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name."),
  team_name: z.string().min(2, "Please enter your team name."),
  phone: phoneSchema,
  email: z.email("Please enter a valid email."),
  note: z.string().max(300, "Keep your note under 300 characters.").trim().optional(),
});

export type AccessRequestInput = z.infer<typeof accessRequestSchema>;

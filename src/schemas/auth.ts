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

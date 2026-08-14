import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name."),
    email: z.email("Please enter a valid email."),
    phone: z
      .string()
      .min(9, "Please enter a valid phone number.")
      .regex(/^[0-9+\s-]+$/, "Please enter a valid phone number."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  identifier: z.string().min(2, "Please enter your name or email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignInInput = z.infer<typeof signInSchema>;

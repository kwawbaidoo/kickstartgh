"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { signUpSchema, type SignUpInput } from "@/schemas/auth";
import { useAuthStore } from "@/store/auth-store";

function SignUpForm() {
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  async function handleSignUp(data: SignUpInput) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    signUp(data);
    router.push("/onboarding");
  }

  return (
    <form onSubmit={form.handleSubmit(handleSignUp)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.fullName}>
          <FieldLabel htmlFor="fullName" required>Full name</FieldLabel>
          <FieldContent>
            <Input
              id="fullName"
              placeholder="e.g. Kojo Boateng"
              autoComplete="name"
              {...form.register("fullName")}
            />
            <FieldError errors={[form.formState.errors.fullName]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email" required>Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              placeholder="e.g. you@example.com"
              autoComplete="email"
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="phone" required>Phone number</FieldLabel>
          <FieldContent>
            <Input
              id="phone"
              placeholder="e.g. 024 000 0000"
              autoComplete="tel"
              {...form.register("phone")}
            />
            <FieldError errors={[form.formState.errors.phone]} />
          </FieldContent>
        </Field>

        <PasswordField
          label="Password"
          autoComplete="new-password"
          description="At least 8 characters."
          error={form.formState.errors.password}
          {...form.register("password")}
        />

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword}
          {...form.register("confirmPassword")}
        />
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
}

export { SignUpForm };

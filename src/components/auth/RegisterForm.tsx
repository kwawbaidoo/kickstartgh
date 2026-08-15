"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { applyApiErrors } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

type RegisterFormProps = {
  /** Registration only creates the account — it does not sign the user in. Called with
   * the just-registered phone number so the caller can hand off to sign in. */
  onRegistered: (phone: string) => void;
};

function RegisterForm({ onRegistered }: RegisterFormProps) {
  const register = useAuthStore((state) => state.register);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", phone: "", password: "", confirm_password: "" },
  });

  async function handleRegister(data: RegisterInput) {
    try {
      await register(data);
      onRegistered(data.phone);
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof RegisterInput, err));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleRegister)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.full_name}>
          <FieldLabel htmlFor="full_name" required>Full name</FieldLabel>
          <FieldContent>
            <Input
              id="full_name"
              placeholder="e.g. Kojo Boateng"
              autoComplete="name"
              {...form.register("full_name")}
            />
            <FieldError errors={[form.formState.errors.full_name]} />
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

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email" optional>Email</FieldLabel>
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
          error={form.formState.errors.confirm_password}
          {...form.register("confirm_password")}
        />

        <FieldError errors={[form.formState.errors.root]} />
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

export { RegisterForm };

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { applyApiErrors } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";

type LoginFormProps = {
  defaultPhone?: string;
};

function LoginForm({ defaultPhone = "" }: LoginFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: defaultPhone, password: "" },
  });

  async function handleLogin(data: LoginInput) {
    try {
      await login(data);
      const hasOnboarded = useOnboardingStore.getState().hasOnboarded;
      router.push(hasOnboarded ? "/dashboard" : "/onboarding");
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof LoginInput, err));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleLogin)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="phone" required>Phone number</FieldLabel>
          <FieldContent>
            <Input
              id="phone"
              placeholder="e.g. 024 000 0000"
              autoComplete="username"
              {...form.register("phone")}
            />
            <FieldError errors={[form.formState.errors.phone]} />
          </FieldContent>
        </Field>

        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={form.formState.errors.password}
          {...form.register("password")}
        />

        <FieldError errors={[form.formState.errors.root]} />
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}

export { LoginForm };

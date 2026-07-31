"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { signInSchema, type SignInInput } from "@/schemas/auth";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";

function SignInForm() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function handleSignIn(data: SignInInput) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    signIn(data.identifier);
    const hasOnboarded = useOnboardingStore.getState().hasOnboarded;
    router.push(hasOnboarded ? "/dashboard" : "/onboarding");
  }

  return (
    <form onSubmit={form.handleSubmit(handleSignIn)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.identifier}>
          <FieldLabel htmlFor="identifier" required>Email or full name</FieldLabel>
          <FieldContent>
            <Input
              id="identifier"
              placeholder="e.g. you@example.com"
              autoComplete="username"
              {...form.register("identifier")}
            />
            <FieldError errors={[form.formState.errors.identifier]} />
          </FieldContent>
        </Field>

        <PasswordField
          label="Password"
          error={form.formState.errors.password}
          {...form.register("password")}
        />
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

export { SignInForm };

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { PasswordField } from "@/components/auth/PasswordField";
import { firstLoginPasswordSchema, type FirstLoginPasswordInput } from "@/schemas/auth";
import { applyApiErrors } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { postSignInPath } from "@/lib/auth-routing";

/**
 * Replaces the temporary password an owner or invited staff member was sent. The password
 * they just signed in with is normally still in memory (`provisional_password`), so it's
 * submitted for them and the field is hidden; after a page refresh it's gone and they're
 * asked for it explicitly.
 */
function FirstLoginForm() {
  const router = useRouter();
  const completeFirstLogin = useAuthStore((state) => state.completeFirstLogin);
  const signOut = useAuthStore((state) => state.signOut);
  const provisionalPassword = useAuthStore((state) => state.provisional_password);

  const form = useForm<FirstLoginPasswordInput>({
    resolver: zodResolver(firstLoginPasswordSchema),
    defaultValues: {
      current_password: provisionalPassword ?? "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Normally hidden: the password they just signed in with is submitted for them. Revealed
  // if the server rejects it, so a stale/mistyped temporary password is recoverable rather
  // than a dead end.
  const showCurrentPassword =
    !provisionalPassword || !!form.formState.errors.current_password;

  async function handleSubmit(data: FirstLoginPasswordInput) {
    try {
      await completeFirstLogin(data);
      router.replace(postSignInPath());
    } catch (error) {
      applyApiErrors(error, (field, err) =>
        form.setError(field as keyof FirstLoginPasswordInput, err)
      );
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
      <FieldGroup>
        {showCurrentPassword && (
          <PasswordField
            label="Temporary password"
            autoComplete="current-password"
            description="The password that was sent to you."
            error={form.formState.errors.current_password}
            {...form.register("current_password")}
          />
        )}

        <PasswordField
          label="New password"
          autoComplete="new-password"
          description="At least 8 characters."
          error={form.formState.errors.new_password}
          {...form.register("new_password")}
        />

        <PasswordField
          label="Confirm new password"
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
            Saving...
          </>
        ) : (
          <>
            <KeyRound />
            Set my password
          </>
        )}
      </Button>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Nobody else can see your new password — not even whoever set up your account.
      </p>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mx-auto"
        onClick={() => {
          signOut().finally(() => router.replace("/"));
        }}
      >
        Sign out instead
      </Button>
    </form>
  );
}

export { FirstLoginForm };

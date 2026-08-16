"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CheckCircle2, KeyRound, LogOut, ShieldCheck, Smartphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/settings";
import { applyApiErrors } from "@/lib/api-client";
import type { Session } from "@/store/settings-store";

type SecurityCardProps = {
  last_login: string;
  two_factor_enabled: boolean;
  sessions: Session[];
  onToggleTwoFactor: () => Promise<void>;
  onLogOutSession: (id: string) => Promise<void>;
  onLogOutAllOtherSessions: () => Promise<void>;
  onChangePassword: (data: ChangePasswordInput) => Promise<void>;
};

function SecurityCard({
  last_login,
  two_factor_enabled,
  sessions,
  onToggleTwoFactor,
  onLogOutSession,
  onLogOutAllOtherSessions,
  onChangePassword,
}: SecurityCardProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  async function handleChangePassword(data: ChangePasswordInput) {
    try {
      await onChangePassword(data);
      form.reset();
      setShowPasswordForm(false);
      setPasswordUpdated(true);
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof ChangePasswordInput, err));
    }
  }

  function handleToggleTwoFactor() {
    setSessionsError(null);
    onToggleTwoFactor().catch(() => setSessionsError("Couldn't update two-factor authentication. Please try again."));
  }

  function handleLogOutSession(id: string) {
    setSessionsError(null);
    onLogOutSession(id).catch(() => setSessionsError("Couldn't log out that device. Please try again."));
  }

  function handleLogOutAllOtherSessions() {
    setSessionsError(null);
    onLogOutAllOtherSessions().catch(() =>
      setSessionsError("Couldn't log out other devices. Please try again.")
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {passwordUpdated && !showPasswordForm && (
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              Password updated.
            </p>
          )}

          {showPasswordForm ? (
            <form onSubmit={form.handleSubmit(handleChangePassword)} className="flex flex-col gap-4">
              <FieldGroup>
                <Field data-invalid={!!form.formState.errors.current_password}>
                  <FieldLabel htmlFor="current_password">Current password</FieldLabel>
                  <FieldContent>
                    <Input id="current_password" type="password" {...form.register("current_password")} />
                    <FieldError errors={[form.formState.errors.current_password]} />
                  </FieldContent>
                </Field>
                <Field data-invalid={!!form.formState.errors.new_password}>
                  <FieldLabel htmlFor="new_password">New password</FieldLabel>
                  <FieldContent>
                    <Input id="new_password" type="password" {...form.register("new_password")} />
                    <FieldError errors={[form.formState.errors.new_password]} />
                  </FieldContent>
                </Field>
                <Field data-invalid={!!form.formState.errors.confirm_password}>
                  <FieldLabel htmlFor="confirm_password">Confirm new password</FieldLabel>
                  <FieldContent>
                    <Input id="confirm_password" type="password" {...form.register("confirm_password")} />
                    <FieldError errors={[form.formState.errors.confirm_password]} />
                  </FieldContent>
                </Field>
              </FieldGroup>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Updating..." : "Update Password"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordUpdated(false);
              }}
            >
              <KeyRound />
              Change Password
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4.5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {two_factor_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Switch checked={two_factor_enabled} onCheckedChange={handleToggleTwoFactor} aria-label="Two-factor authentication" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Last login: {format(new Date(last_login), "d MMM yyyy, HH:mm")}
          </p>
          <Separator />
          {sessionsError && <p className="text-sm text-destructive">{sessionsError}</p>}
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Smartphone className="size-4.5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">
                    {session.device} {session.current && "· This device"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.location} · {session.last_active}
                  </span>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" onClick={() => handleLogOutSession(session.id)}>
                  Log out
                </Button>
              )}
            </div>
          ))}
          {sessions.some((session) => !session.current) && (
            <Button variant="outline" className="w-full" onClick={handleLogOutAllOtherSessions}>
              <LogOut />
              Log Out From All Other Devices
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { SecurityCard };

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
import type { Session } from "@/store/settings-store";

type SecurityCardProps = {
  lastLogin: string;
  twoFactorEnabled: boolean;
  sessions: Session[];
  onToggleTwoFactor: () => void;
  onLogOutSession: (id: string) => void;
  onLogOutAllOtherSessions: () => void;
  onChangePassword: (data: ChangePasswordInput) => void;
};

function SecurityCard({
  lastLogin,
  twoFactorEnabled,
  sessions,
  onToggleTwoFactor,
  onLogOutSession,
  onLogOutAllOtherSessions,
  onChangePassword,
}: SecurityCardProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function handleChangePassword(data: ChangePasswordInput) {
    onChangePassword(data);
    form.reset();
    setShowPasswordForm(false);
    setPasswordUpdated(true);
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
                <Field data-invalid={!!form.formState.errors.currentPassword}>
                  <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                  <FieldContent>
                    <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
                    <FieldError errors={[form.formState.errors.currentPassword]} />
                  </FieldContent>
                </Field>
                <Field data-invalid={!!form.formState.errors.newPassword}>
                  <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                  <FieldContent>
                    <Input id="newPassword" type="password" {...form.register("newPassword")} />
                    <FieldError errors={[form.formState.errors.newPassword]} />
                  </FieldContent>
                </Field>
                <Field data-invalid={!!form.formState.errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                  <FieldContent>
                    <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
                    <FieldError errors={[form.formState.errors.confirmPassword]} />
                  </FieldContent>
                </Field>
              </FieldGroup>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Update Password
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
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={onToggleTwoFactor} aria-label="Two-factor authentication" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Last login: {format(new Date(lastLogin), "d MMM yyyy, HH:mm")}
          </p>
          <Separator />
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Smartphone className="size-4.5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">
                    {session.device} {session.current && "· This device"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.location} · {session.lastActive}
                  </span>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" onClick={() => onLogOutSession(session.id)}>
                  Log out
                </Button>
              )}
            </div>
          ))}
          {sessions.some((session) => !session.current) && (
            <Button variant="outline" className="w-full" onClick={onLogOutAllOtherSessions}>
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

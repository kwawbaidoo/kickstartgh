"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { staffRoleLabel } from "@/config/roles";
import { inviteChannels, type InviteChannel } from "@/config/staff-access";
import { staffInviteSchema, type StaffInviteInput, type StaffMember } from "@/schemas/onboarding";
import type { StaffInviteResult } from "@/store/onboarding-store";
import { buildInviteShareHref, buildInviteWhatsAppHref } from "@/lib/staff";
import { applyApiErrors } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const channelIcons: Record<InviteChannel, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
};

const channelCopy: Record<InviteChannel, string> = {
  email: "Send the sign-in link to their email address.",
  sms: "Text the sign-in link to their phone.",
};

type StaffInviteDialogProps = {
  /** Owned by the parent so `member` can outlive the close, letting the exit animation run. */
  open: boolean;
  member: StaffMember | null;
  teamName: string;
  onOpenChange: (open: boolean) => void;
  onInvite: (id: string, input: StaffInviteInput) => Promise<StaffInviteResult>;
};

/**
 * Grants an existing staff member system access. Two-step by design: send, then report
 * what actually happened. Because the backend doesn't deliver invites yet
 * (BACKEND_GAPS.md §7.2), the result step leads with the link and hand-off buttons unless
 * the API confirms a real send — the manager is never told "sent" on faith.
 *
 * The parent remounts this per open (keyed), so `member` seeds the form directly and there
 * is no effect resetting state when the selected member changes.
 */
function StaffInviteDialog({
  open,
  member,
  teamName,
  onOpenChange,
  onInvite,
}: StaffInviteDialogProps) {
  const [result, setResult] = useState<StaffInviteResult | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<StaffInviteInput>({
    resolver: zodResolver(staffInviteSchema),
    // Prefer email when one is already on file — the channel that needs no extra typing.
    defaultValues: {
      channel: member?.email ? "email" : "sms",
      phone: member?.phone ?? "",
      email: member?.email ?? "",
    },
  });

  const channel = useWatch({ control: form.control, name: "channel" });

  async function handleSend(data: StaffInviteInput) {
    if (!member) return;
    try {
      setResult(await onInvite(member.id, data));
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof StaffInviteInput, err));
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the link stays visible to copy by hand.
    }
  }

  const isResend = member?.access_status === "invited";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        {member && (
          <>
            <DialogHeader>
              <DialogTitle>
                {result ? "Invite created" : isResend ? "Resend invite" : "Invite to the system"}
              </DialogTitle>
              <DialogDescription>
                {result
                  ? `${member.full_name} can set their own password from this link.`
                  : `Give ${member.full_name} (${staffRoleLabel(member.role)}) their own sign-in.`}
              </DialogDescription>
            </DialogHeader>

            {result ? (
              <div className="flex flex-col gap-4">
                {result.delivered ? (
                  <p className="flex items-start gap-2 rounded-lg bg-success/10 p-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    Sent by {result.channel === "email" ? "email" : "SMS"} to{" "}
                    {result.channel === "email" ? member.email : member.phone}.
                  </p>
                ) : (
                  <p className="rounded-lg bg-warning/10 p-3 text-sm text-foreground">
                    The invite is active, but automatic {result.channel === "email" ? "email" : "SMS"}{" "}
                    delivery isn&apos;t switched on yet — send them the link below.
                  </p>
                )}

                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                    {result.invite_url}
                  </span>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={handleCopy}
                    aria-label="Copy invite link"
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <a
                    href={buildInviteWhatsAppHref(member, teamName, result.invite_url, member.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: "lg", className: "w-full" })}
                  >
                    <MessageCircle />
                    WhatsApp
                  </a>
                  <a
                    href={buildInviteShareHref("sms", member, teamName, result.invite_url, member.phone)}
                    className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}
                  >
                    <MessageSquare />
                    SMS
                  </a>
                  <a
                    href={buildInviteShareHref("email", member, teamName, result.invite_url, member.phone)}
                    aria-disabled={!member.email}
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: cn("w-full", !member.email && "pointer-events-none opacity-50"),
                    })}
                  >
                    <Mail />
                    Email
                  </a>
                </div>
              </div>
            ) : (
              <form
                id="staff-invite-form"
                onSubmit={form.handleSubmit(handleSend)}
                className="flex flex-col gap-5"
              >
                <FieldGroup>
                  <Field data-invalid={!!form.formState.errors.channel}>
                    <FieldLabel required>How should we send it?</FieldLabel>
                    <FieldContent>
                      <Controller
                        control={form.control}
                        name="channel"
                        render={({ field }) => (
                          <div role="radiogroup" className="grid grid-cols-2 gap-2">
                            {inviteChannels.map((option) => {
                              const Icon = channelIcons[option];
                              const selected = field.value === option;

                              return (
                                <button
                                  key={option}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => field.onChange(option)}
                                  className={cn(
                                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors outline-none",
                                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                                    selected
                                      ? "border-primary/40 bg-primary/5"
                                      : "border-border hover:bg-muted/60 dark:bg-input/20 dark:hover:bg-input/40"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex items-center gap-1.5 text-sm font-medium",
                                      selected ? "text-primary" : "text-foreground"
                                    )}
                                  >
                                    <Icon className="size-4" aria-hidden="true" />
                                    {option === "email" ? "Email" : "SMS"}
                                  </span>
                                  <span className="text-xs leading-snug text-muted-foreground">
                                    {channelCopy[option]}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      />
                      <FieldError errors={[form.formState.errors.channel]} />
                    </FieldContent>
                  </Field>

                  {channel === "email" ? (
                    <Field data-invalid={!!form.formState.errors.email}>
                      <FieldLabel htmlFor="invite-email" required>
                        Email address
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="invite-email"
                          type="email"
                          autoComplete="email"
                          placeholder="e.g. coach@example.com"
                          {...form.register("email")}
                        />
                        <FieldError errors={[form.formState.errors.email]} />
                        <FieldDescription>
                          Saved to their staff record so you don&apos;t have to retype it.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  ) : (
                    <Field data-invalid={!!form.formState.errors.phone}>
                      <FieldLabel htmlFor="invite-phone" required>
                        Phone number
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="invite-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          {...form.register("phone")}
                        />
                        <FieldError errors={[form.formState.errors.phone]} />
                      </FieldContent>
                    </Field>
                  )}

                  <FieldError errors={[form.formState.errors.root]} />
                </FieldGroup>

                <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  They&apos;ll be asked to choose their own password the first time they sign in.
                </p>
              </form>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {result ? "Done" : "Cancel"}
              </Button>
              {!result && (
                <Button
                  type="submit"
                  form="staff-invite-form"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send />
                      {isResend ? "Resend invite" : "Send invite"}
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { StaffInviteDialog };

"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Copy, Loader2, MessageCircle, UserPlus, X } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { Modal } from "@/components/common/Modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { staffRoleOptions } from "@/config/roles";
import { staffFormSchema, type StaffFormInput, type StaffMember } from "@/schemas/onboarding";
import { buildStaffCredentialsMessage, generateTempPassword } from "@/lib/staff";
import { fadeInUp } from "@/lib/motion";
import { getInitials, toSelectItems } from "@/lib/utils";

const staffRoleItems = toSelectItems(staffRoleOptions);

type StaffManagerProps = {
  staff: StaffMember[];
  teamName: string;
  onAdd: (member: StaffMember) => void;
  onRemove: (id: string) => void;
  onChangeRole: (id: string, role: StaffFormInput["role"]) => void;
};

type CredentialState = {
  member: StaffMember;
  tempPassword: string;
  status: "sending" | "sent";
};

function StaffManager({ staff, teamName, onAdd, onRemove, onChangeRole }: StaffManagerProps) {
  const [credentialState, setCredentialState] = useState<CredentialState | null>(null);
  const [copied, setCopied] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const form = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { fullName: "", phone: "", email: "" },
  });

  function handleAdd(data: StaffFormInput) {
    const member: StaffMember = { id: crypto.randomUUID(), ...data };
    onAdd(member);
    form.reset({ fullName: "", phone: "", email: "" });
    setFormKey((current) => current + 1);

    const tempPassword = generateTempPassword();
    setCredentialState({ member, tempPassword, status: "sending" });
    setCopied(false);
    setTimeout(() => {
      setCredentialState((current) =>
        current && current.member.id === member.id ? { ...current, status: "sent" } : current
      );
    }, 900);
  }

  async function handleCopyPassword() {
    if (!credentialState) return;
    try {
      await navigator.clipboard.writeText(credentialState.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the password is still visible to copy manually.
    }
  }

  const shareMessage = credentialState
    ? buildStaffCredentialsMessage(credentialState.member, teamName, credentialState.tempPassword)
    : "";

  return (
    <div className="flex flex-col gap-6">
      <form key={formKey} onSubmit={form.handleSubmit(handleAdd)} className="flex flex-col gap-4">
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.role}>
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select items={staffRoleItems} value={field.value ?? null} onValueChange={field.onChange}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffRoleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.role]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.fullName}>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <FieldContent>
              <Input id="fullName" placeholder="e.g. Kojo Boateng" {...form.register("fullName")} />
              <FieldError errors={[form.formState.errors.fullName]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <FieldContent>
              <Input id="phone" placeholder="e.g. 024 123 4567" {...form.register("phone")} />
              <FieldError errors={[form.formState.errors.phone]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="staffEmail">Email</FieldLabel>
          <FieldContent>
            <Input
              id="staffEmail"
              type="email"
              placeholder="e.g. coach@example.com"
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
            <FieldDescription>Optional — used to send their login details</FieldDescription>
          </FieldContent>
        </Field>

        <Button type="submit" variant="outline" className="w-full">
          <UserPlus />
          Add staff member
        </Button>
      </form>

      {staff.length > 0 ? (
        <Stagger className="flex flex-col gap-2">
          {staff.map((member) => (
            <motion.div
              key={member.id}
              variants={fadeInUp}
              className="flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(member.fullName)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{member.fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{member.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  items={staffRoleItems}
                  value={member.role}
                  onValueChange={(value) => onChangeRole(member.id, value as StaffFormInput["role"])}
                >
                  <SelectTrigger size="sm" className="w-full sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${member.fullName}`}
                  onClick={() => onRemove(member.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </Stagger>
      ) : (
        <EmptyState title="No staff members added yet." description="Add coaches and managers to your team." />
      )}

      <Modal
        open={!!credentialState}
        onOpenChange={(open) => !open && setCredentialState(null)}
        title="Staff account created"
        description={
          credentialState ? `${credentialState.member.fullName} has been added to your team.` : undefined
        }
      >
        {credentialState && (
          <div className="flex flex-col gap-4">
            {credentialState.status === "sending" ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Sending login credentials...
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {credentialState.member.email && (
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="size-4 text-primary" />
                    Sent via Email to {credentialState.member.email}
                  </span>
                )}
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  Sent via SMS to {credentialState.member.phone}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
              <span className="font-mono text-sm font-medium text-foreground">
                {credentialState.tempPassword}
              </span>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={handleCopyPassword}
                aria-label="Copy temporary password"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>

            <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              Demo mode — no real email or SMS is sent. Use &ldquo;Share via WhatsApp&rdquo; below to actually
              deliver these details.
            </p>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ className: "w-full" })}
            >
              <MessageCircle />
              Share via WhatsApp
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}

export { StaffManager };

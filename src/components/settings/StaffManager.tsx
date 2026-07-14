"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { UserPlus, X } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { staffRoleOptions } from "@/config/roles";
import { staffFormSchema, type StaffFormInput, type StaffMember } from "@/schemas/onboarding";
import { fadeInUp } from "@/lib/motion";
import { getInitials, toSelectItems } from "@/lib/utils";

const staffRoleItems = toSelectItems(staffRoleOptions);

type StaffManagerProps = {
  staff: StaffMember[];
  onAdd: (member: StaffMember) => void;
  onRemove: (id: string) => void;
  onChangeRole: (id: string, role: StaffFormInput["role"]) => void;
};

function StaffManager({ staff, onAdd, onRemove, onChangeRole }: StaffManagerProps) {
  const form = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  function handleAdd(data: StaffFormInput) {
    onAdd({ id: crypto.randomUUID(), ...data });
    form.reset({ fullName: "", phone: "" });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={form.handleSubmit(handleAdd)} className="flex flex-col gap-4">
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

          <Field orientation="responsive" data-invalid={!!form.formState.errors.fullName}>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <FieldContent>
              <Input id="fullName" placeholder="e.g. Kojo Boateng" {...form.register("fullName")} />
              <FieldError errors={[form.formState.errors.fullName]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive" data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <FieldContent>
              <Input id="phone" placeholder="e.g. 024 123 4567" {...form.register("phone")} />
              <FieldError errors={[form.formState.errors.phone]} />
            </FieldContent>
          </Field>
        </FieldGroup>

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
    </div>
  );
}

export { StaffManager };

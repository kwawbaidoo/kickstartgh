"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { isBuiltInStaffRole } from "@/config/roles";
import { staffRoleSchema, type StaffMember } from "@/schemas/onboarding";
import { applyApiErrors } from "@/lib/api-client";

const formSchema = z.object({ role: staffRoleSchema });
type FormInput = z.infer<typeof formSchema>;

type StaffRoleDialogProps = {
  open: boolean;
  member: StaffMember | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (role: string) => Promise<void>;
};

/**
 * Types a role that isn't in the row's dropdown yet. Reached from that dropdown's
 * "Other role..." item, because a `<Select>` can't accept a value it doesn't already list.
 *
 * Remounted per open by the parent (keyed), so `member` seeds the field directly and no
 * effect is needed to reset it.
 */
function StaffRoleDialog({ open, member, onOpenChange, onSubmit }: StaffRoleDialogProps) {
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    // A built-in is stored as a camelCase id, so start blank rather than prefill "headCoach".
    defaultValues: { role: member && !isBuiltInStaffRole(member.role) ? member.role : "" },
  });

  async function handleSubmit(data: FormInput) {
    try {
      await onSubmit(data.role);
      onOpenChange(false);
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof FormInput, err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set a custom role</DialogTitle>
          <DialogDescription>
            {member
              ? `What does ${member.full_name} do on your team?`
              : "Give this staff member a role."}
          </DialogDescription>
        </DialogHeader>

        <form id="staff-role-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <Field data-invalid={!!form.formState.errors.role}>
            <FieldLabel htmlFor="custom-role-name" required>
              Role
            </FieldLabel>
            <FieldContent>
              <Input
                id="custom-role-name"
                autoFocus
                placeholder="e.g. Physio, Kit Manager, Welfare Officer"
                {...form.register("role")}
              />
              <FieldError errors={[form.formState.errors.role, form.formState.errors.root]} />
              <FieldDescription>
                Anyone else on your team can be given this role afterwards.
              </FieldDescription>
            </FieldContent>
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="staff-role-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check />
                Save role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { StaffRoleDialog };

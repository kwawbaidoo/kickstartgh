"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";

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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { RolePicker } from "@/components/settings/RolePicker";
import { staffFormSchema, type StaffFormInput } from "@/schemas/onboarding";
import { applyApiErrors } from "@/lib/api-client";

const emptyStaff: StaffFormInput = {
  role: "headCoach",
  full_name: "",
  phone: "",
  email: "",
};

type StaffFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: StaffFormInput) => Promise<unknown>;
  /** Custom roles this team already uses, shown as extra cards in the picker. */
  roleSuggestions?: string[];
};

function StaffFormDialog({
  open,
  onOpenChange,
  onSubmit,
  roleSuggestions = [],
}: StaffFormDialogProps) {
  const form = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: emptyStaff,
  });

  // Reopening after a successful add should be a blank form, not the last one submitted.
  useEffect(() => {
    if (open) form.reset(emptyStaff);
  }, [open, form]);

  async function handleSubmit(data: StaffFormInput) {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof StaffFormInput, err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a staff member</DialogTitle>
          <DialogDescription>
            This records them on your team. They won&apos;t be able to sign in until you invite
            them separately.
          </DialogDescription>
        </DialogHeader>

        <form
          id="staff-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-5"
        >
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.role}>
              <FieldLabel required>Role</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <RolePicker
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      suggestions={roleSuggestions}
                      invalid={!!form.formState.errors.role}
                      inputId="staff-custom-role"
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.role]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.full_name}>
              <FieldLabel htmlFor="staff-full-name" required>
                Full name
              </FieldLabel>
              <FieldContent>
                <Input
                  id="staff-full-name"
                  autoComplete="name"
                  placeholder="e.g. Kojo Boateng"
                  {...form.register("full_name")}
                />
                <FieldError errors={[form.formState.errors.full_name]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.phone}>
              <FieldLabel htmlFor="staff-phone" required>
                Phone number
              </FieldLabel>
              <FieldContent>
                <Input
                  id="staff-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="e.g. 024 123 4567"
                  {...form.register("phone")}
                />
                <FieldError errors={[form.formState.errors.phone]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="staff-email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="staff-email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. coach@example.com"
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
                <FieldDescription>
                  Optional — needed only if you want to invite them by email later.
                </FieldDescription>
              </FieldContent>
            </Field>

            <FieldError errors={[form.formState.errors.root]} />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="staff-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus />
                Add staff member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { StaffFormDialog };

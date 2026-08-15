"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Users } from "lucide-react";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { StaffCard } from "@/components/onboarding/StaffCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffRoleOptions } from "@/config/roles";
import { staffFormSchema, type StaffFormInput } from "@/schemas/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";
import { applyApiErrors } from "@/lib/api-client";
import { toSelectItems } from "@/lib/utils";

const staffRoleItems = toSelectItems(staffRoleOptions);

export default function StaffSetupPage() {
  const router = useRouter();
  const staff = useOnboardingStore((state) => state.activeTeam.staff);
  const addStaffMember = useOnboardingStore((state) => state.addStaffMember);
  const removeStaffMember = useOnboardingStore((state) => state.removeStaffMember);

  const form = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { full_name: "", phone: "" },
  });

  async function handleAdd(data: StaffFormInput) {
    try {
      await addStaffMember(data);
      form.reset({ full_name: "", phone: "" });
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof StaffFormInput, err));
    }
  }

  function handleContinue() {
    router.push("/onboarding/invite");
  }

  return (
    <OnboardingLayout
      step={2}
      backHref="/onboarding/team"
      title="Add your management team"
      description="Add coaches and staff now, or skip and do it later."
    >
      <form onSubmit={form.handleSubmit(handleAdd)} className="flex flex-col gap-4">
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.role}>
            <FieldLabel htmlFor="role" required>Role</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select
                    items={staffRoleItems}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
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

          <Field  data-invalid={!!form.formState.errors.full_name}>
            <FieldLabel htmlFor="full_name" required>Full name</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <Input
                    id="full_name"
                    placeholder="e.g. Kojo Boateng"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.full_name]} />
            </FieldContent>
          </Field>

          <Field  data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="phone" required>Phone number</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <Input
                    id="phone"
                    placeholder="e.g. 024 123 4567"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.phone]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <FieldError errors={[form.formState.errors.root]} />

        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <UserPlus />
          {form.formState.isSubmitting ? "Adding..." : "Add staff member"}
        </Button>
      </form>

      {staff.length > 0 ? (
        <Stagger className="flex flex-col gap-2">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onRemove={() => {
                removeStaffMember(member.id).catch(() => {});
              }}
            />
          ))}
        </Stagger>
      ) : (
        <EmptyState icon={Users} title="No staff members added yet." />
      )}

      <div className="flex flex-col gap-2">
        <Button size="lg" className="w-full" onClick={handleContinue}>
          {staff.length > 0 ? "Continue" : "Skip for now"}
        </Button>
      </div>
    </OnboardingLayout>
  );
}

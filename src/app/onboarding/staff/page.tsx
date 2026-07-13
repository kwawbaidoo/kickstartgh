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

export default function StaffSetupPage() {
  const router = useRouter();
  const staff = useOnboardingStore((state) => state.draft.staff);
  const addStaffMember = useOnboardingStore((state) => state.addStaffMember);
  const removeStaffMember = useOnboardingStore((state) => state.removeStaffMember);

  const form = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  function handleAdd(data: StaffFormInput) {
    addStaffMember({ id: crypto.randomUUID(), ...data });
    form.reset({ fullName: "", phone: "" });
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
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value ?? null} onValueChange={field.onChange}>
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

          <Field orientation="responsive">
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <Input
                    id="fullName"
                    placeholder="e.g. Kojo Boateng"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.fullName]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
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

        <Button type="submit" variant="outline" className="w-full">
          <UserPlus />
          Add staff member
        </Button>
      </form>

      {staff.length > 0 ? (
        <Stagger className="flex flex-col gap-2">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onRemove={() => removeStaffMember(member.id)}
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

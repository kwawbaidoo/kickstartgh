"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarUpload } from "@/components/common/AvatarUpload";
import { roleOptions } from "@/config/roles";
import { profileFormSchema, type ProfileFormInput } from "@/schemas/settings";
import { getInitials, toSelectItems } from "@/lib/utils";

const roleItems = toSelectItems(roleOptions.map((option) => ({ value: option.id, label: option.label })));

type ProfileFormProps = {
  defaultValues: ProfileFormInput;
  date_joined: string;
  teamName: string;
  onSubmit: (data: ProfileFormInput) => void;
};

function ProfileForm({ defaultValues, date_joined, teamName, onSubmit }: ProfileFormProps) {
  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const full_name = useWatch({ control: form.control, name: "full_name" });
  const photo = useWatch({ control: form.control, name: "photo" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <AvatarUpload
        value={photo}
        onChange={(dataUrl) => form.setValue("photo", dataUrl)}
        fallbackText={full_name ? getInitials(full_name) : undefined}
        label="Profile picture"
        alt="Profile picture preview"
      />

      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.full_name}>
          <FieldLabel htmlFor="full_name">Full name</FieldLabel>
          <FieldContent>
            <Input id="full_name" placeholder="e.g. Kojo Boateng" {...form.register("full_name")} />
            <FieldError errors={[form.formState.errors.full_name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="phone">Phone number</FieldLabel>
          <FieldContent>
            <Input id="phone" placeholder="e.g. 024 000 0000" {...form.register("phone")} />
            <FieldError errors={[form.formState.errors.phone]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input id="email" type="email" placeholder="e.g. you@example.com" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="preferred_role">Preferred role</FieldLabel>
          <FieldContent>
            <Controller
              control={form.control}
              name="preferred_role"
              render={({ field }) => (
                <Select items={roleItems} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="preferred_role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel>Date joined</FieldLabel>
          <FieldContent>
            <p className="text-sm text-muted-foreground">{format(new Date(date_joined), "d MMM yyyy")}</p>
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel>Team</FieldLabel>
          <FieldContent>
            <p className="text-sm text-muted-foreground">{teamName}</p>
            <FieldDescription>Managed under Team Settings</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full">
        Save Changes
      </Button>
    </form>
  );
}

export { ProfileForm };

"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { AvatarUpload } from "@/components/common/AvatarUpload";
import { ghanaRegions } from "@/config/regions";
import { teamDetailsSchema, type TeamDetailsInput } from "@/schemas/onboarding";
import { applyApiErrors } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";
import type { z } from "zod";

type TeamFormValues = z.input<typeof teamDetailsSchema>;

type TeamFormProps = {
  defaultValues?: Partial<TeamDetailsInput>;
  onSubmit: (data: TeamDetailsInput) => Promise<void>;
  submitLabel?: string;
};

function TeamForm({ defaultValues, onSubmit, submitLabel = "Continue" }: TeamFormProps) {
  const form = useForm<TeamFormValues, unknown, TeamDetailsInput>({
    resolver: zodResolver(teamDetailsSchema),
    defaultValues: {
      name: "",
      nickname: "",
      region: "",
      district: "",
      home_ground: "",
      color_primary: "#1e3a8a",
      color_secondary: "#2563eb",
      slogan: "",
      ...defaultValues,
    },
  });

  const teamName = useWatch({ control: form.control, name: "name" });
  const logo = useWatch({ control: form.control, name: "logo" });

  async function handleSubmit(data: TeamDetailsInput) {
    try {
      await onSubmit(data);
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof TeamDetailsInput, err));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
      <AvatarUpload
        value={logo}
        onChange={(url) => form.setValue("logo", url)}
        fallbackText={teamName ? getInitials(teamName) : undefined}
        label="Team logo (optional)"
        alt="Team logo preview"
      />

      <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-x-6">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="name" required>Team name</FieldLabel>
          <FieldContent>
            <Input id="name" placeholder="e.g. Osagyefo FC" {...form.register("name")} />
            <FieldError errors={[form.formState.errors.name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.nickname}>
          <FieldLabel htmlFor="nickname" optional>Nickname</FieldLabel>
          <FieldContent>
            <Input id="nickname" placeholder="e.g. The Lions" {...form.register("nickname")} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.region}>
          <FieldLabel htmlFor="region" required>Region</FieldLabel>
          <FieldContent>
            <Controller
              control={form.control}
              name="region"
              render={({ field }) => (
                <Combobox
                  items={[...ghanaRegions]}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <ComboboxInput id="region" placeholder="Search region..." className="w-full" />
                  <ComboboxContent>
                    <ComboboxEmpty>No region found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            <FieldError errors={[form.formState.errors.region]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.district}>
          <FieldLabel htmlFor="district" required>District</FieldLabel>
          <FieldContent>
            <Input id="district" placeholder="e.g. Ellembelle" {...form.register("district")} />
            <FieldError errors={[form.formState.errors.district]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.home_ground}>
          <FieldLabel htmlFor="home_ground" required>Home ground</FieldLabel>
          <FieldContent>
            <Input
              id="home_ground"
              placeholder="e.g. Community Park"
              {...form.register("home_ground")}
            />
            <FieldError errors={[form.formState.errors.home_ground]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.year_established}>
          <FieldLabel htmlFor="year_established" required>Year established</FieldLabel>
          <FieldContent>
            <Input
              id="year_established"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 2018"
              {...form.register("year_established")}
            />
            <FieldError errors={[form.formState.errors.year_established]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive" className="sm:col-span-2">
          <FieldLabel htmlFor="color_primary" optional>Team colors</FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-3">
              <input
                id="color_primary"
                type="color"
                className="size-9 rounded-lg border border-input"
                {...form.register("color_primary")}
              />
              <input
                type="color"
                aria-label="Secondary color"
                className="size-9 rounded-lg border border-input"
                {...form.register("color_secondary")}
              />
            </div>
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.slogan} className="sm:col-span-2">
          <FieldLabel htmlFor="slogan" optional>Team slogan</FieldLabel>
          <FieldContent>
            <Textarea id="slogan" placeholder="e.g. One team, one dream." {...form.register("slogan")} />
            <FieldError errors={[form.formState.errors.slogan]} />
          </FieldContent>
        </Field>
      </FieldGroup>

      <FieldError errors={[form.formState.errors.root]} />

      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

export { TeamForm };

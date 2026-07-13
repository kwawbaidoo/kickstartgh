"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Field,
  FieldContent,
  FieldDescription,
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
import { getInitials } from "@/lib/utils";
import type { z } from "zod";

type TeamFormValues = z.input<typeof teamDetailsSchema>;

type TeamFormProps = {
  defaultValues?: Partial<TeamDetailsInput>;
  onSubmit: (data: TeamDetailsInput) => void;
};

function TeamForm({ defaultValues, onSubmit }: TeamFormProps) {
  const form = useForm<TeamFormValues, unknown, TeamDetailsInput>({
    resolver: zodResolver(teamDetailsSchema),
    defaultValues: {
      name: "",
      nickname: "",
      region: "",
      district: "",
      homeGround: "",
      colorPrimary: "#323232",
      colorSecondary: "#ffdb00",
      slogan: "",
      ...defaultValues,
    },
  });

  const teamName = useWatch({ control: form.control, name: "name" });
  const logo = useWatch({ control: form.control, name: "logo" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <AvatarUpload
        value={logo}
        onChange={(dataUrl) => form.setValue("logo", dataUrl)}
        fallbackText={teamName ? getInitials(teamName) : undefined}
        label="Team logo (optional)"
        alt="Team logo preview"
      />

      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="name">Team name</FieldLabel>
          <FieldContent>
            <Input id="name" placeholder="e.g. Osagyefo FC" {...form.register("name")} />
            <FieldError errors={[form.formState.errors.name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.nickname}>
          <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
          <FieldContent>
            <Input id="nickname" placeholder="e.g. The Lions" {...form.register("nickname")} />
            <FieldDescription>Optional</FieldDescription>
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.region}>
          <FieldLabel htmlFor="region">Region</FieldLabel>
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
          <FieldLabel htmlFor="district">District</FieldLabel>
          <FieldContent>
            <Input id="district" placeholder="e.g. Ellembelle" {...form.register("district")} />
            <FieldError errors={[form.formState.errors.district]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.homeGround}>
          <FieldLabel htmlFor="homeGround">Home ground</FieldLabel>
          <FieldContent>
            <Input
              id="homeGround"
              placeholder="e.g. Community Park"
              {...form.register("homeGround")}
            />
            <FieldError errors={[form.formState.errors.homeGround]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.yearEstablished}>
          <FieldLabel htmlFor="yearEstablished">Year established</FieldLabel>
          <FieldContent>
            <Input
              id="yearEstablished"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 2018"
              {...form.register("yearEstablished")}
            />
            <FieldError errors={[form.formState.errors.yearEstablished]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="colorPrimary">Team colors</FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-3">
              <input
                id="colorPrimary"
                type="color"
                className="size-9 rounded-lg border border-input"
                {...form.register("colorPrimary")}
              />
              <input
                type="color"
                aria-label="Secondary color"
                className="size-9 rounded-lg border border-input"
                {...form.register("colorSecondary")}
              />
              <FieldDescription>Optional</FieldDescription>
            </div>
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.slogan}>
          <FieldLabel htmlFor="slogan">Team slogan</FieldLabel>
          <FieldContent>
            <Textarea id="slogan" placeholder="e.g. One team, one dream." {...form.register("slogan")} />
            <FieldError errors={[form.formState.errors.slogan]} />
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full">
        Continue
      </Button>
    </form>
  );
}

export { TeamForm };

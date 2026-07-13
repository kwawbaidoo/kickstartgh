"use client";

import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(defaultValues?.logo);

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

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      form.setValue("logo", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground ring-1 ring-foreground/10"
        >
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="Team logo preview" className="size-full object-cover" />
          ) : (
            <span>{teamName ? getInitials(teamName) : <Camera className="size-6" />}</span>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-medium text-white">
            Upload
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
        <span className="text-xs text-muted-foreground">Team logo (optional)</span>
      </div>

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

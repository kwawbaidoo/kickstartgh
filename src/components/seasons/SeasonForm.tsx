"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressStepper } from "@/components/onboarding/ProgressStepper";
import { competitionCategoryOptions } from "@/config/seasons";
import { seasonFormSchema, type SeasonFormInput } from "@/schemas/season";

type SeasonFormValues = z.input<typeof seasonFormSchema>;

type SeasonFormProps = {
  defaultValues?: Partial<SeasonFormInput>;
  onSubmit: (data: SeasonFormInput) => void;
  submitLabel?: string;
};

const stepLabels = ["Basics", "Details"];

const stepFields: (keyof SeasonFormInput)[][] = [
  ["name", "startDate", "endDate"],
  ["description", "objectives", "competitionCategory", "budget", "colorPrimary", "colorSecondary"],
];

function SeasonForm({ defaultValues, onSubmit, submitLabel = "Create Season" }: SeasonFormProps) {
  const [step, setStep] = useState(0);

  const form = useForm<SeasonFormValues, unknown, SeasonFormInput>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      objectives: "",
      competitionCategory: "",
      colorPrimary: "#1e3a8a",
      colorSecondary: "#2563eb",
      ...defaultValues,
    },
  });

  const competitionCategory = useWatch({ control: form.control, name: "competitionCategory" });

  async function handleNext() {
    const valid = await form.trigger(stepFields[step]);
    if (valid) setStep((current) => Math.min(stepLabels.length - 1, current + 1));
  }

  function handleBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <ProgressStepper steps={stepLabels} currentStep={step} />

      {step === 0 && (
        <FieldSet>
          <FieldLegend>Season Basics</FieldLegend>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="name">Season name</FieldLabel>
              <FieldContent>
                <Input id="name" placeholder="e.g. 2026 Season" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
                <FieldDescription>
                  Examples: &ldquo;2026 Season&rdquo;, &ldquo;2026/27 Season&rdquo;, &ldquo;Community
                  League 2026&rdquo;
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.startDate}>
              <FieldLabel htmlFor="startDate">Start date</FieldLabel>
              <FieldContent>
                <Input id="startDate" type="date" {...form.register("startDate")} />
                <FieldError errors={[form.formState.errors.startDate]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.endDate}>
              <FieldLabel htmlFor="endDate">End date</FieldLabel>
              <FieldContent>
                <Input id="endDate" type="date" {...form.register("endDate")} />
                <FieldError errors={[form.formState.errors.endDate]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      )}

      {step === 1 && (
        <FieldSet>
          <FieldLegend>Season Details</FieldLegend>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Textarea
                  id="description"
                  placeholder="What's this season about?"
                  {...form.register("description")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="objectives">Team objectives</FieldLabel>
              <FieldContent>
                <Textarea
                  id="objectives"
                  placeholder="e.g. Promotion, cup run, develop youth players"
                  {...form.register("objectives")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="competitionCategory">Competition category</FieldLabel>
              <FieldContent>
                <Select
                  items={Object.fromEntries(competitionCategoryOptions.map((option) => [option, option]))}
                  value={competitionCategory || null}
                  onValueChange={(value) => form.setValue("competitionCategory", value ?? "")}
                >
                  <SelectTrigger id="competitionCategory" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitionCategoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.budget}>
              <FieldLabel htmlFor="budget">Team budget (GHS)</FieldLabel>
              <FieldContent>
                <Input
                  id="budget"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 5000"
                  {...form.register("budget")}
                />
                <FieldError errors={[form.formState.errors.budget]} />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <Field orientation="responsive">
            <FieldLabel htmlFor="colorPrimary">Season colors</FieldLabel>
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
        </FieldSet>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        {step < stepLabels.length - 1 ? (
          <Button key="next" type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button key="submit" type="submit">
            {submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}

export { SeasonForm };

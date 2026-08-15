"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverImageUpload } from "@/components/common/CoverImageUpload";
import { ProgressStepper } from "@/components/onboarding/ProgressStepper";
import { matchTypeOptions } from "@/config/matches";
import { matchFormSchema, type MatchFormInput } from "@/schemas/match";
import { applyApiErrors } from "@/lib/api-client";
import { toSelectItems } from "@/lib/utils";

const matchTypeItems = toSelectItems(matchTypeOptions);

const stepLabels = ["Match Details", "Extras"];

const stepFields: (keyof MatchFormInput)[][] = [
  ["opponent", "competition", "match_type", "venue", "homeAway", "date", "kickoff_time"],
  ["referee", "notes", "poster"],
];

type MatchFormProps = {
  defaultValues?: Partial<MatchFormInput>;
  competitions: string[];
  onSubmit: (data: MatchFormInput) => Promise<void>;
  submitLabel?: string;
};

function MatchForm({ defaultValues, competitions, onSubmit, submitLabel = "Create Match" }: MatchFormProps) {
  const [step, setStep] = useState(0);

  const form = useForm<MatchFormInput>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      opponent: "",
      competition: "",
      venue: "",
      homeAway: "Home",
      date: "",
      kickoff_time: "",
      referee: "",
      notes: "",
      ...defaultValues,
    },
  });

  const poster = useWatch({ control: form.control, name: "poster" });

  async function handleFormSubmit(data: MatchFormInput) {
    try {
      await onSubmit(data);
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof MatchFormInput, err));
    }
  }

  async function handleNext() {
    const valid = await form.trigger(stepFields[step]);
    if (valid) setStep((current) => Math.min(stepLabels.length - 1, current + 1));
  }

  function handleBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col gap-8">
      <ProgressStepper steps={stepLabels} currentStep={step} />

      {step === 0 && (
        <FieldSet>
          <FieldLegend>Match Details</FieldLegend>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.opponent}>
              <FieldLabel htmlFor="opponent">Opponent</FieldLabel>
              <FieldContent>
                <Input id="opponent" placeholder="e.g. Unity FC" {...form.register("opponent")} />
                <FieldError errors={[form.formState.errors.opponent]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.competition}>
              <FieldLabel htmlFor="competition">Competition</FieldLabel>
              <FieldContent>
                <Input
                  id="competition"
                  list="competition-suggestions"
                  placeholder="e.g. District League"
                  {...form.register("competition")}
                />
                <datalist id="competition-suggestions">
                  {competitions.map((competition) => (
                    <option key={competition} value={competition} />
                  ))}
                </datalist>
                <FieldError errors={[form.formState.errors.competition]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.match_type}>
              <FieldLabel htmlFor="match_type">Match type</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="match_type"
                  render={({ field }) => (
                    <Select items={matchTypeItems} value={field.value ?? null} onValueChange={field.onChange}>
                      <SelectTrigger id="match_type" className="w-full">
                        <SelectValue placeholder="Select match type" />
                      </SelectTrigger>
                      <SelectContent>
                        {matchTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.match_type]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.venue}>
              <FieldLabel htmlFor="venue">Venue</FieldLabel>
              <FieldContent>
                <Input id="venue" placeholder="e.g. Community Park" {...form.register("venue")} />
                <FieldError errors={[form.formState.errors.venue]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Field data-invalid={!!form.formState.errors.homeAway}>
            <FieldLabel>Home or away</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="homeAway"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid-flow-col">
                    {(["Home", "Away"] as const).map((option) => (
                      <FieldLabel key={option} className="font-normal">
                        <RadioGroupItem value={option} />
                        {option}
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                )}
              />
              <FieldError errors={[form.formState.errors.homeAway]} />
            </FieldContent>
          </Field>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.date}>
              <FieldLabel htmlFor="date">Match date</FieldLabel>
              <FieldContent>
                <Input id="date" type="date" {...form.register("date")} />
                <FieldError errors={[form.formState.errors.date]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.kickoff_time}>
              <FieldLabel htmlFor="kickoff_time">Kickoff time</FieldLabel>
              <FieldContent>
                <Input id="kickoff_time" type="time" {...form.register("kickoff_time")} />
                <FieldError errors={[form.formState.errors.kickoff_time]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      )}

      {step === 1 && (
        <FieldSet>
          <FieldLegend>Extras</FieldLegend>

          <FieldGroup>
            <Field orientation="responsive">
              <FieldLabel htmlFor="referee">Referee</FieldLabel>
              <FieldContent>
                <Input id="referee" placeholder="e.g. Mr. Kwabena Sarfo" {...form.register("referee")} />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Match notes</FieldLabel>
              <FieldContent>
                <Textarea id="notes" placeholder="Any extra details..." {...form.register("notes")} />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Match poster</FieldLabel>
              <FieldContent>
                <CoverImageUpload
                  value={poster}
                  onChange={(url) => form.setValue("poster", url)}
                  label="Optional"
                  alt="Match poster preview"
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      )}

      <FieldError errors={[form.formState.errors.root]} />

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        {step < stepLabels.length - 1 ? (
          <Button key="next" type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}

export { MatchForm };

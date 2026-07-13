"use client";

import { useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";

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
import { matchTypeOptions } from "@/config/matches";
import { matchFormSchema, type MatchFormInput } from "@/schemas/match";
import { toSelectItems } from "@/lib/utils";

const matchTypeItems = toSelectItems(matchTypeOptions);

type MatchFormProps = {
  defaultValues?: Partial<MatchFormInput>;
  competitions: string[];
  onSubmit: (data: MatchFormInput) => void;
  submitLabel?: string;
};

function MatchForm({ defaultValues, competitions, onSubmit, submitLabel = "Create Match" }: MatchFormProps) {
  const posterInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MatchFormInput>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      opponent: "",
      competition: "",
      venue: "",
      homeAway: "Home",
      date: "",
      kickoffTime: "",
      referee: "",
      notes: "",
      ...defaultValues,
    },
  });

  const poster = useWatch({ control: form.control, name: "poster" });

  function handlePosterChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => form.setValue("poster", reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Match Details</FieldLegend>

        <FieldGroup>
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
                placeholder="e.g. Ellembelle District League"
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

          <Field data-invalid={!!form.formState.errors.matchType}>
            <FieldLabel htmlFor="matchType">Match type</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="matchType"
                render={({ field }) => (
                  <Select items={matchTypeItems} value={field.value ?? null} onValueChange={field.onChange}>
                    <SelectTrigger id="matchType" className="w-full">
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
              <FieldError errors={[form.formState.errors.matchType]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.venue}>
            <FieldLabel htmlFor="venue">Venue</FieldLabel>
            <FieldContent>
              <Input id="venue" placeholder="e.g. Community Park" {...form.register("venue")} />
              <FieldError errors={[form.formState.errors.venue]} />
            </FieldContent>
          </Field>

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

          <Field orientation="responsive" data-invalid={!!form.formState.errors.date}>
            <FieldLabel htmlFor="date">Match date</FieldLabel>
            <FieldContent>
              <Input id="date" type="date" {...form.register("date")} />
              <FieldError errors={[form.formState.errors.date]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive" data-invalid={!!form.formState.errors.kickoffTime}>
            <FieldLabel htmlFor="kickoffTime">Kickoff time</FieldLabel>
            <FieldContent>
              <Input id="kickoffTime" type="time" {...form.register("kickoffTime")} />
              <FieldError errors={[form.formState.errors.kickoffTime]} />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

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
              <button
                type="button"
                onClick={() => posterInputRef.current?.click()}
                className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted text-muted-foreground"
              >
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster} alt="Match poster preview" className="size-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <ImagePlus className="size-5" />
                    Upload poster
                  </span>
                )}
              </button>
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterChange}
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button type="submit" size="lg" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

export { MatchForm };

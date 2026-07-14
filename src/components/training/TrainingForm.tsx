"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";

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
import { trainingFocusOptions } from "@/config/training";
import { trainingFormSchema, type TrainingFormInput } from "@/schemas/training";
import { toSelectItems } from "@/lib/utils";

const focusItems = toSelectItems(trainingFocusOptions);

type TrainingFormProps = {
  defaultValues?: Partial<TrainingFormInput>;
  onSubmit: (data: TrainingFormInput) => void;
  submitLabel?: string;
};

function TrainingForm({ defaultValues, onSubmit, submitLabel = "Schedule Session" }: TrainingFormProps) {
  const [equipmentInput, setEquipmentInput] = useState("");

  const form = useForm<TrainingFormInput>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      description: "",
      notes: "",
      equipment: [],
      ...defaultValues,
    },
  });

  const equipment = useWatch({ control: form.control, name: "equipment" }) ?? [];

  function addEquipment() {
    const value = equipmentInput.trim();
    if (!value) return;
    form.setValue("equipment", [...equipment, value]);
    setEquipmentInput("");
  }

  function removeEquipment(item: string) {
    form.setValue(
      "equipment",
      equipment.filter((existing) => existing !== item)
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Session Details</FieldLegend>

        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.title}>
            <FieldLabel htmlFor="title">Session title</FieldLabel>
            <FieldContent>
              <Input id="title" placeholder="e.g. Tuesday Training" {...form.register("title")} />
              <FieldError errors={[form.formState.errors.title]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive" data-invalid={!!form.formState.errors.date}>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <FieldContent>
              <Input id="date" type="date" {...form.register("date")} />
              <FieldError errors={[form.formState.errors.date]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive" data-invalid={!!form.formState.errors.startTime}>
            <FieldLabel htmlFor="startTime">Start time</FieldLabel>
            <FieldContent>
              <Input id="startTime" type="time" {...form.register("startTime")} />
              <FieldError errors={[form.formState.errors.startTime]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive" data-invalid={!!form.formState.errors.endTime}>
            <FieldLabel htmlFor="endTime">End time</FieldLabel>
            <FieldContent>
              <Input id="endTime" type="time" {...form.register("endTime")} />
              <FieldError errors={[form.formState.errors.endTime]} />
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
      </FieldSet>

      <FieldSet>
        <FieldLegend>Focus &amp; Notes</FieldLegend>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="focus">Training focus</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="focus"
                render={({ field }) => (
                  <Select items={focusItems} value={field.value ?? null} onValueChange={field.onChange}>
                    <SelectTrigger id="focus" className="w-full">
                      <SelectValue placeholder="Select a focus (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingFocusOptions.map((focus) => (
                        <SelectItem key={focus} value={focus}>
                          {focus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <FieldContent>
              <Textarea
                id="description"
                placeholder="What's the plan for this session?"
                {...form.register("description")}
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="equipment">Equipment checklist</FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                <Input
                  id="equipment"
                  placeholder="e.g. Cones"
                  value={equipmentInput}
                  onChange={(event) => setEquipmentInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addEquipment();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addEquipment} aria-label="Add item">
                  <Plus />
                </Button>
              </div>
              {equipment.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {equipment.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipment(item)}
                        aria-label={`Remove ${item}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="notes">Coach notes</FieldLabel>
            <FieldContent>
              <Textarea id="notes" placeholder="Any extra details..." {...form.register("notes")} />
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

export { TrainingForm };

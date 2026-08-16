"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "@/components/common/AvatarUpload";
import { ProgressStepper } from "@/components/onboarding/ProgressStepper";
import {
  positionOptions,
  preferredFootOptions,
  statusOptions,
} from "@/config/players";
import type { Player } from "@/mock/players";
import { createPlayerFormSchema, type PlayerFormInput } from "@/schemas/player";
import { applyApiErrors } from "@/lib/api-client";
import { getInitials, toSelectItems } from "@/lib/utils";

type PlayerFormSchema = ReturnType<typeof createPlayerFormSchema>;
type PlayerFormValues = z.input<PlayerFormSchema>;

const positionItems = toSelectItems(positionOptions);
const statusItems = toSelectItems(statusOptions);

const stepLabels = ["Personal Info", "Football Info", "Additional Info"];

const stepFields: (keyof PlayerFormInput)[][] = [
  [
    "full_name",
    "nickname",
    "date_of_birth",
    "phone",
    "emergency_contact",
    "photo",
  ],
  ["jersey_number", "position", "secondary_position", "preferred_foot"],
  ["village", "previous_club", "status"],
];

type PlayerFormProps = {
  defaultValues?: Partial<PlayerFormInput>;
  existingPlayers: Player[];
  excludeId?: string;
  onSubmit: (data: PlayerFormInput) => Promise<void>;
  submitLabel?: string;
};

function PlayerForm({
  defaultValues,
  existingPlayers,
  excludeId,
  onSubmit,
  submitLabel = "Register Player",
}: PlayerFormProps) {
  const [step, setStep] = useState(0);

  const schema = useMemo(
    () => createPlayerFormSchema(existingPlayers, excludeId),
    [existingPlayers, excludeId],
  );

  const form = useForm<PlayerFormValues, unknown, PlayerFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      nickname: "",
      phone: "",
      emergency_contact: "",
      village: "",
      previous_club: "",
      preferred_foot: "Right",
      status: "Active",
      ...defaultValues,
    },
  });

  const full_name = useWatch({ control: form.control, name: "full_name" });
  const photo = useWatch({ control: form.control, name: "photo" });

  async function handleFormSubmit(data: PlayerFormInput) {
    try {
      await onSubmit(data);
    } catch (error) {
      applyApiErrors(error, (field, err) => form.setError(field as keyof PlayerFormInput, err));
    }
  }

  async function handleNext() {
    const valid = await form.trigger(stepFields[step]);
    if (valid)
      setStep((current) => Math.min(stepLabels.length - 1, current + 1));
  }

  function handleBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-8"
    >
      <ProgressStepper steps={stepLabels} currentStep={step} />

      {step === 0 && (
        <FieldSet>
          <FieldLegend>Personal Information</FieldLegend>

          <AvatarUpload
            value={photo}
            onChange={(dataUrl) => form.setValue("photo", dataUrl)}
            fallbackText={full_name ? getInitials(full_name) : undefined}
            label="Player photo (optional)"
            alt="Player photo preview"
          />

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field data-invalid={!!form.formState.errors.full_name}>
              <FieldLabel htmlFor="full_name" required>Full name</FieldLabel>
              <FieldContent>
                <Input
                  id="full_name"
                  placeholder="e.g. Kwesi Mensah"
                  {...form.register("full_name")}
                />
                <FieldError errors={[form.formState.errors.full_name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="nickname" optional>Nickname</FieldLabel>
              <FieldContent>
                <Input
                  id="nickname"
                  placeholder="e.g. KM9"
                  {...form.register("nickname")}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field data-invalid={!!form.formState.errors.date_of_birth}>
              <FieldLabel htmlFor="date_of_birth" required>Date of birth</FieldLabel>
              <FieldContent>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...form.register("date_of_birth")}
                />
                <FieldError errors={[form.formState.errors.date_of_birth]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="phone" optional>Phone number</FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  placeholder="e.g. 024 123 4567"
                  {...form.register("phone")}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Field data-invalid={!!form.formState.errors.emergency_contact}>
            <FieldLabel htmlFor="emergency_contact" optional>
              Emergency contact
            </FieldLabel>
            <FieldContent>
              <Input
                id="emergency_contact"
                placeholder="e.g. Comfort Mensah - 024 000 0000"
                {...form.register("emergency_contact")}
              />
              <FieldError errors={[form.formState.errors.emergency_contact]} />
            </FieldContent>
          </Field>
        </FieldSet>
      )}

      {step === 1 && (
        <FieldSet>
          <FieldLegend>Football Information</FieldLegend>

          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.jersey_number}>
              <FieldLabel htmlFor="jersey_number" required>Jersey number</FieldLabel>
              <FieldContent>
                <Input
                  id="jersey_number"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 9"
                  {...form.register("jersey_number")}
                />
                <FieldError errors={[form.formState.errors.jersey_number]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.position}>
              <FieldLabel htmlFor="position" required>Primary position</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <Select
                      items={positionItems}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="position" className="w-full">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.position]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.secondary_position}>
              <FieldLabel htmlFor="secondary_position" optional>
                Secondary position
              </FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="secondary_position"
                  render={({ field }) => (
                    <Select
                      items={positionItems}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="secondary_position" className="w-full">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.secondary_position]}
                />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.preferred_foot}>
              <FieldLabel required>Preferred foot</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="preferred_foot"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid-flow-col"
                    >
                      {preferredFootOptions.map((foot) => (
                        <FieldLabel key={foot} className="font-normal">
                          <RadioGroupItem value={foot} />
                          {foot}
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  )}
                />
                <FieldError errors={[form.formState.errors.preferred_foot]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      )}

      {step === 2 && (
        <FieldSet>
          <FieldLegend>Additional Information</FieldLegend>

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="village" optional>Village / Town</FieldLabel>
              <FieldContent>
                <Input
                  id="village"
                  placeholder="e.g. Ellembelle"
                  {...form.register("village")}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="previous_club" optional>Previous club</FieldLabel>
              <FieldContent>
                <Input
                  id="previous_club"
                  placeholder="e.g. Axim Stars Youth"
                  {...form.register("previous_club")}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <Field
            orientation="responsive"
            data-invalid={!!form.formState.errors.status}
          >
            <FieldLabel htmlFor="status" required>Player status</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    items={statusItems}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.status]} />
            </FieldContent>
          </Field>
        </FieldSet>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
        >
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

export { PlayerForm };

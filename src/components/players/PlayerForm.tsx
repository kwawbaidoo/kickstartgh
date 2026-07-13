"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { positionOptions, preferredFootOptions, statusOptions } from "@/config/players";
import type { Player } from "@/mock/players";
import { createPlayerFormSchema, type PlayerFormInput } from "@/schemas/player";
import { getInitials, toSelectItems } from "@/lib/utils";

type PlayerFormSchema = ReturnType<typeof createPlayerFormSchema>;
type PlayerFormValues = z.input<PlayerFormSchema>;

const positionItems = toSelectItems(positionOptions);
const statusItems = toSelectItems(statusOptions);

type PlayerFormProps = {
  defaultValues?: Partial<PlayerFormInput>;
  existingPlayers: Player[];
  excludeId?: string;
  onSubmit: (data: PlayerFormInput) => void;
  submitLabel?: string;
};

function PlayerForm({
  defaultValues,
  existingPlayers,
  excludeId,
  onSubmit,
  submitLabel = "Register Player",
}: PlayerFormProps) {
  const schema = useMemo(
    () => createPlayerFormSchema(existingPlayers, excludeId),
    [existingPlayers, excludeId]
  );

  const form = useForm<PlayerFormValues, unknown, PlayerFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      nickname: "",
      phone: "",
      emergencyContact: "",
      village: "",
      previousClub: "",
      preferredFoot: "Right",
      status: "Active",
      ...defaultValues,
    },
  });

  const fullName = useWatch({ control: form.control, name: "fullName" });
  const photo = useWatch({ control: form.control, name: "photo" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Personal Information</FieldLegend>

        <AvatarUpload
          value={photo}
          onChange={(dataUrl) => form.setValue("photo", dataUrl)}
          fallbackText={fullName ? getInitials(fullName) : undefined}
          label="Player photo (optional)"
          alt="Player photo preview"
        />

        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.fullName}>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <FieldContent>
              <Input id="fullName" placeholder="e.g. Kwesi Mensah" {...form.register("fullName")} />
              <FieldError errors={[form.formState.errors.fullName]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
            <FieldContent>
              <Input id="nickname" placeholder="e.g. KM9" {...form.register("nickname")} />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.dateOfBirth}>
            <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
            <FieldContent>
              <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
              <FieldError errors={[form.formState.errors.dateOfBirth]} />
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <FieldContent>
              <Input id="phone" placeholder="e.g. 024 123 4567" {...form.register("phone")} />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel htmlFor="emergencyContact">Emergency contact</FieldLabel>
            <FieldContent>
              <Input
                id="emergencyContact"
                placeholder="e.g. 024 000 0000"
                {...form.register("emergencyContact")}
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Football Information</FieldLegend>

        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.jerseyNumber}>
            <FieldLabel htmlFor="jerseyNumber">Jersey number</FieldLabel>
            <FieldContent>
              <Input
                id="jerseyNumber"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 9"
                {...form.register("jerseyNumber")}
              />
              <FieldError errors={[form.formState.errors.jerseyNumber]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.position}>
            <FieldLabel htmlFor="position">Primary position</FieldLabel>
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

          <Field data-invalid={!!form.formState.errors.secondaryPosition}>
            <FieldLabel htmlFor="secondaryPosition">Secondary position</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="secondaryPosition"
                render={({ field }) => (
                  <Select
                    items={positionItems}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="secondaryPosition" className="w-full">
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
              <FieldError errors={[form.formState.errors.secondaryPosition]} />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.preferredFoot}>
            <FieldLabel>Preferred foot</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="preferredFoot"
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
              <FieldError errors={[form.formState.errors.preferredFoot]} />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Additional Information</FieldLegend>

        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel htmlFor="village">Village / Town</FieldLabel>
            <FieldContent>
              <Input id="village" placeholder="e.g. Ellembelle" {...form.register("village")} />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel htmlFor="previousClub">Previous club</FieldLabel>
            <FieldContent>
              <Input
                id="previousClub"
                placeholder="e.g. Axim Stars Youth"
                {...form.register("previousClub")}
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.status}>
            <FieldLabel htmlFor="status">Player status</FieldLabel>
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
        </FieldGroup>
      </FieldSet>

      <Button type="submit" size="lg" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

export { PlayerForm };

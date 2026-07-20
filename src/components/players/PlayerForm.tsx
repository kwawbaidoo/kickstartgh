"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
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
import { TagListInput } from "@/components/common/TagListInput";
import { ProgressStepper } from "@/components/onboarding/ProgressStepper";
import {
  positionOptions,
  preferredFootOptions,
  statusOptions,
} from "@/config/players";
import type { Player } from "@/mock/players";
import { createPlayerFormSchema, type PlayerFormInput } from "@/schemas/player";
import { getInitials, toSelectItems } from "@/lib/utils";

type PlayerFormSchema = ReturnType<typeof createPlayerFormSchema>;
type PlayerFormValues = z.input<PlayerFormSchema>;

const positionItems = toSelectItems(positionOptions);
const statusItems = toSelectItems(statusOptions);

const stepLabels = ["Personal Info", "Football Info", "Additional Info", "Marketability"];

const stepFields: (keyof PlayerFormInput)[][] = [
  [
    "fullName",
    "nickname",
    "dateOfBirth",
    "phone",
    "email",
    "emergencyContact",
    "photo",
  ],
  ["jerseyNumber", "position", "secondaryPosition", "preferredFoot"],
  ["village", "previousClub", "status"],
  ["profile"],
];

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
  const [step, setStep] = useState(0);

  const schema = useMemo(
    () => createPlayerFormSchema(existingPlayers, excludeId),
    [existingPlayers, excludeId],
  );

  const form = useForm<PlayerFormValues, unknown, PlayerFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      nickname: "",
      phone: "",
      email: "",
      emergencyContact: { name: "", phone: "", email: "" },
      village: "",
      previousClub: "",
      preferredFoot: "Right",
      status: "Active",
      profile: {
        nationality: "",
        height: "",
        education: [],
        workExperience: [],
        achievements: [],
        otherSports: [],
        socialLinks: { instagram: "", twitter: "", facebook: "", tiktok: "" },
      },
      ...defaultValues,
    },
  });

  const fullName = useWatch({ control: form.control, name: "fullName" });
  const photo = useWatch({ control: form.control, name: "photo" });
  const education = useWatch({ control: form.control, name: "profile.education" }) ?? [];
  const workExperience = useWatch({ control: form.control, name: "profile.workExperience" }) ?? [];
  const achievements = useWatch({ control: form.control, name: "profile.achievements" }) ?? [];
  const otherSports = useWatch({ control: form.control, name: "profile.otherSports" }) ?? [];

  const [educationInstitution, setEducationInstitution] = useState("");
  const [educationPeriod, setEducationPeriod] = useState("");

  function addEducationEntry() {
    const institution = educationInstitution.trim();
    const period = educationPeriod.trim();
    if (!institution || !period) return;
    form.setValue("profile.education", [...education, { institution, period }]);
    setEducationInstitution("");
    setEducationPeriod("");
  }

  function removeEducationEntry(index: number) {
    form.setValue(
      "profile.education",
      education.filter((_, i) => i !== index)
    );
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
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-8"
    >
      <ProgressStepper steps={stepLabels} currentStep={step} />

      {step === 0 && (
        <FieldSet>
          <FieldLegend>Personal Information</FieldLegend>

          <AvatarUpload
            value={photo}
            onChange={(dataUrl) => form.setValue("photo", dataUrl)}
            fallbackText={fullName ? getInitials(fullName) : undefined}
            label="Player photo (optional)"
            alt="Player photo preview"
          />

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field data-invalid={!!form.formState.errors.fullName}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <FieldContent>
                <Input
                  id="fullName"
                  placeholder="e.g. Kwesi Mensah"
                  {...form.register("fullName")}
                />
                <FieldError errors={[form.formState.errors.fullName]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="nickname">Nickname </FieldLabel>
              <FieldContent>
                <Input
                  id="nickname"
                  placeholder="e.g. KM9"
                  {...form.register("nickname")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field data-invalid={!!form.formState.errors.dateOfBirth}>
              <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
              <FieldContent>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register("dateOfBirth")}
                />
                <FieldError errors={[form.formState.errors.dateOfBirth]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone number</FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  placeholder="e.g. 024 123 4567"
                  {...form.register("phone")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
          <Field
            orientation="responsive"
            data-invalid={!!form.formState.errors.email}
          >
            <FieldLabel htmlFor="email">Player email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="e.g. player@example.com"
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Emergency Contact
          </span>

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="emergencyContactName">
                Contact name
              </FieldLabel>
              <FieldContent>
                <Input
                  id="emergencyContactName"
                  placeholder="e.g. Comfort Mensah"
                  {...form.register("emergencyContact.name")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="emergencyContactPhone">
                Contact phone
              </FieldLabel>
              <FieldContent>
                <Input
                  id="emergencyContactPhone"
                  placeholder="e.g. 024 000 0000"
                  {...form.register("emergencyContact.phone")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
          <Field
            orientation="responsive"
            data-invalid={!!form.formState.errors.emergencyContact?.email}
          >
            <FieldLabel htmlFor="emergencyContactEmail">
              Contact email
            </FieldLabel>
            <FieldContent>
              <Input
                id="emergencyContactEmail"
                type="email"
                placeholder="e.g. contact@example.com"
                {...form.register("emergencyContact.email")}
              />
              <FieldError
                errors={[form.formState.errors.emergencyContact?.email]}
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>
        </FieldSet>
      )}

      {step === 1 && (
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
              <FieldLabel htmlFor="secondaryPosition">
                Secondary position
              </FieldLabel>
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
                <FieldError
                  errors={[form.formState.errors.secondaryPosition]}
                />
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
      )}

      {step === 2 && (
        <FieldSet>
          <FieldLegend>Additional Information</FieldLegend>

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="village">Village / Town</FieldLabel>
              <FieldContent>
                <Input
                  id="village"
                  placeholder="e.g. Ellembelle"
                  {...form.register("village")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
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
          </FieldGroup>
          <Field
            orientation="responsive"
            data-invalid={!!form.formState.errors.status}
          >
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
        </FieldSet>
      )}

      {step === 3 && (
        <FieldSet>
          <FieldLegend>Marketability</FieldLegend>
          <FieldDescription>
            Optional — fill this in for players you want to promote to scouts or other clubs. It shows
            up on the player&apos;s public shareable profile.
          </FieldDescription>

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="nationality">Nationality</FieldLabel>
              <FieldContent>
                <Input
                  id="nationality"
                  placeholder="e.g. Ghanaian"
                  {...form.register("profile.nationality")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="height">Height</FieldLabel>
              <FieldContent>
                <Input
                  id="height"
                  placeholder="e.g. 5ft 10in"
                  {...form.register("profile.height")}
                />
                <FieldDescription>Optional</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor="educationInstitution">Education</FieldLabel>
            <FieldContent>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="educationInstitution"
                  placeholder="Institution"
                  value={educationInstitution}
                  onChange={(event) => setEducationInstitution(event.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Period, e.g. 2019-2022"
                  value={educationPeriod}
                  onChange={(event) => setEducationPeriod(event.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addEducationEntry}
                  aria-label="Add education entry"
                  disabled={!educationInstitution.trim() || !educationPeriod.trim()}
                >
                  <Plus />
                </Button>
              </div>
              {education.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  {education.map((entry, index) => (
                    <div
                      key={`${entry.institution}-${index}`}
                      className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate text-foreground">{entry.institution}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{entry.period}</span>
                      <button
                        type="button"
                        onClick={() => removeEducationEntry(index)}
                        aria-label={`Remove ${entry.institution}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="workExperience">Work experience</FieldLabel>
            <FieldContent>
              <TagListInput
                id="workExperience"
                value={workExperience}
                onChange={(value) => form.setValue("profile.workExperience", value)}
                placeholder="e.g. Coaching assistant"
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="achievements">Achievements</FieldLabel>
            <FieldContent>
              <TagListInput
                id="achievements"
                value={achievements}
                onChange={(value) => form.setValue("profile.achievements", value)}
                placeholder="e.g. League top scorer (2025)"
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="otherSports">Other sports</FieldLabel>
            <FieldContent>
              <TagListInput
                id="otherSports"
                value={otherSports}
                onChange={(value) => form.setValue("profile.otherSports", value)}
                placeholder="e.g. Athletics"
              />
              <FieldDescription>Optional</FieldDescription>
            </FieldContent>
          </Field>

          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Social Links
          </span>

          <FieldGroup className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Field data-invalid={!!form.formState.errors.profile?.socialLinks?.instagram}>
              <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
              <FieldContent>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/..."
                  {...form.register("profile.socialLinks.instagram")}
                />
                <FieldError errors={[form.formState.errors.profile?.socialLinks?.instagram]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.profile?.socialLinks?.twitter}>
              <FieldLabel htmlFor="twitter">X / Twitter</FieldLabel>
              <FieldContent>
                <Input
                  id="twitter"
                  placeholder="https://x.com/..."
                  {...form.register("profile.socialLinks.twitter")}
                />
                <FieldError errors={[form.formState.errors.profile?.socialLinks?.twitter]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.profile?.socialLinks?.facebook}>
              <FieldLabel htmlFor="facebook">Facebook</FieldLabel>
              <FieldContent>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/..."
                  {...form.register("profile.socialLinks.facebook")}
                />
                <FieldError errors={[form.formState.errors.profile?.socialLinks?.facebook]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.profile?.socialLinks?.tiktok}>
              <FieldLabel htmlFor="tiktok">TikTok</FieldLabel>
              <FieldContent>
                <Input
                  id="tiktok"
                  placeholder="https://tiktok.com/@..."
                  {...form.register("profile.socialLinks.tiktok")}
                />
                <FieldError errors={[form.formState.errors.profile?.socialLinks?.tiktok]} />
              </FieldContent>
            </Field>
          </FieldGroup>
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

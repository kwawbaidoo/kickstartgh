"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  dateFormatOptions,
  defaultHomeScreenOptions,
  favoriteShortcutOptions,
  languageOptions,
  themeOptions,
} from "@/config/settings";
import { useSettingsStore } from "@/store/settings-store";
import { toSelectItems } from "@/lib/utils";

const homeScreenItems = toSelectItems(
  defaultHomeScreenOptions.map((option) => ({ value: option.value, label: option.label }))
);

export default function PreferencesPage() {
  const preferences = useSettingsStore((state) => state.preferences);
  const updatePreferences = useSettingsStore((state) => state.updatePreferences);
  const toggleFavoriteShortcut = useSettingsStore((state) => state.toggleFavoriteShortcut);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Preferences" description="Customize how KickStartGH looks and works for you." />

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.theme}
            onValueChange={(value) => updatePreferences({ theme: value as typeof preferences.theme })}
            className="grid-flow-col"
          >
            {themeOptions.map((option) => (
              <FieldLabel key={option.value} className="font-normal">
                <RadioGroupItem value={option.value} />
                {option.label}
              </FieldLabel>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.language}
            onValueChange={(value) => updatePreferences({ language: value as typeof preferences.language })}
          >
            {languageOptions.map((option) => (
              <FieldLabel key={option.value} className="font-normal has-disabled:opacity-50">
                <RadioGroupItem value={option.value} disabled={option.disabled} />
                {option.label}
              </FieldLabel>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date Format</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.dateFormat}
            onValueChange={(value) => updatePreferences({ dateFormat: value as typeof preferences.dateFormat })}
          >
            {dateFormatOptions.map((option) => (
              <FieldLabel key={option.value} className="font-normal">
                <RadioGroupItem value={option.value} />
                {option.label}
              </FieldLabel>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="defaultHomeScreen">Default home screen</FieldLabel>
            <FieldContent>
              <Select
                items={homeScreenItems}
                value={preferences.defaultHomeScreen}
                onValueChange={(value) => value && updatePreferences({ defaultHomeScreen: value })}
              >
                <SelectTrigger id="defaultHomeScreen" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultHomeScreenOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Favorite shortcuts</FieldLabel>
            <FieldContent>
              <FieldGroup className="gap-2">
                {favoriteShortcutOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={preferences.favoriteShortcuts.includes(option.value)}
                      onCheckedChange={() => toggleFavoriteShortcut(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </FieldGroup>
            </FieldContent>
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}

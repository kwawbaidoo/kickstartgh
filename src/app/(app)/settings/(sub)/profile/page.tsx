"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { applyApiErrors } from "@/lib/api-client";
import { roleIds } from "@/config/roles";
import type { ProfileFormInput } from "@/schemas/settings";

export default function ProfileSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(data: ProfileFormInput) {
    setSaved(false);
    setError(null);
    try {
      await updateProfile(data);
      setSaved(true);
    } catch (submitError) {
      applyApiErrors(submitError, () => setError("Couldn't update your profile. Please try again."));
    }
  }

  const defaultValues: ProfileFormInput = {
    full_name: user.full_name,
    phone: user.phone,
    email: user.email ?? "",
    photo: user.photo ?? undefined,
    preferred_role: (user.preferred_role as ProfileFormInput["preferred_role"]) ?? roleIds[0],
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="My Profile" description="Your personal details across KickStartGH." />
      {saved && <p className="text-sm text-primary">Profile updated.</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ProfileForm
        defaultValues={defaultValues}
        date_joined={user.date_joined}
        teamName={teamName}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

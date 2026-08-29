"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { StaffManager } from "@/components/settings/StaffManager";
import { PermissionTable } from "@/components/settings/PermissionTable";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function StaffSettingsPage() {
  const staff = useOnboardingStore((state) => state.activeTeam.staff);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const addStaffMember = useOnboardingStore((state) => state.addStaffMember);
  const removeStaffMember = useOnboardingStore((state) => state.removeStaffMember);
  const updateStaffMemberRole = useOnboardingStore((state) => state.updateStaffMemberRole);
  const inviteStaffMember = useOnboardingStore((state) => state.inviteStaffMember);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Staff & Roles"
        description="Add coaches and managers, set what each can do, and invite the ones who need to sign in."
      />

      <StaffManager
        staff={staff}
        teamName={teamName}
        onAdd={addStaffMember}
        onRemove={removeStaffMember}
        onChangeRole={updateStaffMemberRole}
        onInvite={inviteStaffMember}
      />

      <section className="flex flex-col gap-3">
        <SectionHeader title="Permissions" description="What each role can do today." />
        <PermissionTable />
      </section>
    </div>
  );
}

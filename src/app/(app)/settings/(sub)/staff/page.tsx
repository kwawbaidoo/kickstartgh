"use client";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { StaffManager } from "@/components/settings/StaffManager";
import { PermissionTable } from "@/components/settings/PermissionTable";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function StaffSettingsPage() {
  const staff = useOnboardingStore((state) => state.activeTeam.staff);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const addActiveStaffMember = useOnboardingStore((state) => state.addActiveStaffMember);
  const removeActiveStaffMember = useOnboardingStore((state) => state.removeActiveStaffMember);
  const updateActiveStaffMemberRole = useOnboardingStore((state) => state.updateActiveStaffMemberRole);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Staff & Roles" description="Add coaches and managers, and see what each role can do." />

      <StaffManager
        staff={staff}
        teamName={teamName}
        onAdd={addActiveStaffMember}
        onRemove={removeActiveStaffMember}
        onChangeRole={updateActiveStaffMemberRole}
      />

      <section className="flex flex-col gap-3">
        <SectionHeader title="Permissions" description="What each role can do today." />
        <PermissionTable />
      </section>
    </div>
  );
}

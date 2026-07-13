import { Users } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function PlayersPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Players" description="View and manage your squad." />
      <EmptyState
        icon={Users}
        title="No players added yet."
        description="Build your squad digitally."
        actionLabel="Add your first player"
      />
    </div>
  );
}

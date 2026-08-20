"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StaffAccessBadge } from "@/components/settings/StaffAccessBadge";
import { staffRoleLabel } from "@/config/roles";
import type { StaffMember } from "@/schemas/onboarding";
import { fadeInUp } from "@/lib/motion";
import { getInitials } from "@/lib/utils";

type StaffCardProps = {
  member: StaffMember;
  onRemove?: () => void;
};

function StaffCard({ member, onRemove }: StaffCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] dark:shadow-none dark:ring-foreground/10"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {getInitials(member.full_name)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium text-foreground">{member.full_name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {staffRoleLabel(member.role)} · {member.phone}
        </span>
      </div>

      <StaffAccessBadge status={member.access_status} className="shrink-0" />
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${member.full_name}`}
          onClick={onRemove}
        >
          <X className="size-4" />
        </Button>
      )}
    </motion.div>
  );
}

export { StaffCard };

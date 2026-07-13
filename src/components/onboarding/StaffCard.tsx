"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { staffRoleOptions } from "@/config/roles";
import type { StaffMember } from "@/schemas/onboarding";
import { fadeInUp } from "@/lib/motion";
import { getInitials } from "@/lib/utils";

type StaffCardProps = {
  member: StaffMember;
  onRemove?: () => void;
};

function StaffCard({ member, onRemove }: StaffCardProps) {
  const roleLabel = staffRoleOptions.find((option) => option.value === member.role)?.label;

  return (
    <motion.div
      variants={fadeInUp}
      className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {getInitials(member.fullName)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{member.fullName}</span>
        <span className="truncate text-xs text-muted-foreground">
          {roleLabel} · {member.phone}
        </span>
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${member.fullName}`}
          onClick={onRemove}
        >
          <X className="size-4" />
        </Button>
      )}
    </motion.div>
  );
}

export { StaffCard };

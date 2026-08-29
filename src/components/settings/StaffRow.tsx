"use client";

import { motion } from "framer-motion";
import { Link2, MoreVertical, RefreshCw, Send, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffAccessBadge } from "@/components/settings/StaffAccessBadge";

import { isBuiltInStaffRole, staffRoleLabel, staffRoleMeta, staffRoleOptions } from "@/config/roles";
import type { StaffMember } from "@/schemas/onboarding";
import { fadeInUp } from "@/lib/motion";
import { getInitials } from "@/lib/utils";

/** Sentinel item: roles are free text, and a <Select> can't accept a new one. */
const CUSTOM_ROLE = "__custom__";

type StaffRowProps = {
  member: StaffMember;
  /** Custom roles already in use on this team, offered next to the built-in four. */
  roleSuggestions: string[];
  onChangeRole: (role: string) => void;
  /** Opens the dialog for typing a role that isn't in the list yet. */
  onEnterCustomRole: () => void;
  onInvite: () => void;
  onRemove: () => void;
  onCopyInviteLink: () => void;
};

function StaffRow({
  member,
  roleSuggestions,
  onChangeRole,
  onEnterCustomRole,
  onInvite,
  onRemove,
  onCopyInviteLink,
}: StaffRowProps) {
  const builtInRole = isBuiltInStaffRole(member.role) ? staffRoleMeta[member.role] : null;
  const RoleIcon = builtInRole?.icon ?? UserRound;

  // The member's own role is included explicitly: a custom role that no one else on the
  // team shares wouldn't otherwise be in the list, and Select would render it blank.
  const roleValues = [
    ...staffRoleOptions.map((option) => option.value as string),
    ...roleSuggestions.filter((role) => role !== member.role),
    ...(staffRoleOptions.some((option) => option.value === member.role) ||
    roleSuggestions.includes(member.role)
      ? []
      : [member.role]),
  ];
  const roleItems: Record<string, string> = {
    ...Object.fromEntries(roleValues.map((role) => [role, staffRoleLabel(role)])),
    [CUSTOM_ROLE]: "Other role...",
  };
  const hasAccess = member.access_status === "active";
  const isInvited = member.access_status === "invited";

  return (
    <motion.article
      variants={fadeInUp}
      className="flex flex-col gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:gap-4 sm:p-4 dark:shadow-none dark:ring-foreground/10"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-primary/15 sm:size-11"
        >
          {getInitials(member.full_name)}
        </span>

        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">{member.full_name}</span>
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <RoleIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{member.phone}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
        <span className="order-1 flex shrink-0 sm:w-24">
          <StaffAccessBadge status={member.access_status} />
        </span>

        <div className="order-3 flex w-full min-w-0 items-center gap-2 sm:order-2 sm:w-auto">
          <Select
            items={roleItems}
            value={member.role}
            onValueChange={(value) => {
              if (value === CUSTOM_ROLE) {
                onEnterCustomRole();
                return;
              }
              onChangeRole(String(value));
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label={`Role for ${member.full_name}`}
              className="min-w-0 flex-1 sm:w-40 sm:flex-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleValues.map((role) => (
                <SelectItem key={role} value={role}>
                  {staffRoleLabel(role)}
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_ROLE}>Other role...</SelectItem>
            </SelectContent>
          </Select>

          {!hasAccess ? (
            <Button
              type="button"
              size="sm"
              variant={isInvited ? "outline" : "default"}
              onClick={onInvite}
              className="shrink-0 sm:w-20"
            >
              {isInvited ? <RefreshCw /> : <Send />}
              {isInvited ? "Resend" : "Invite"}
            </Button>
          ) : (
            <span aria-hidden="true" className="hidden shrink-0 sm:block sm:w-20" />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${member.full_name}`}
                className="order-2 ml-auto shrink-0 sm:order-3 sm:ml-0"
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {member.invite_url && (
              <>
                <DropdownMenuItem onClick={onCopyInviteLink}>
                  <Link2 />
                  Copy invite link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <Trash2 />
              Remove from team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.article>
  );
}

export { StaffRow };

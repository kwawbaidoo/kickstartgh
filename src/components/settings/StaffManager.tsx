"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, ShieldCheck, UserPlus, Users } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { SearchBar } from "@/components/common/SearchBar";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffRow } from "@/components/settings/StaffRow";
import { StaffFormDialog } from "@/components/settings/StaffFormDialog";
import { StaffInviteDialog } from "@/components/settings/StaffInviteDialog";
import { StaffRoleDialog } from "@/components/settings/StaffRoleDialog";
import { customRolesInUse, staffRoleLabel } from "@/config/roles";
import { staffAccessMeta, staffAccessStatuses } from "@/config/staff-access";
import type { StaffFormInput, StaffInviteInput, StaffMember } from "@/schemas/onboarding";
import type { StaffInviteResult } from "@/store/onboarding-store";

const accessFilters = ["all", ...staffAccessStatuses] as const;
type AccessFilter = (typeof accessFilters)[number];

const accessFilterItems: Record<AccessFilter, string> = {
  all: "All staff",
  no_access: staffAccessMeta.no_access.label,
  invited: staffAccessMeta.invited.label,
  active: staffAccessMeta.active.label,
};

type StaffManagerProps = {
  staff: StaffMember[];
  teamName: string;
  onAdd: (input: StaffFormInput) => Promise<StaffMember>;
  onRemove: (id: string) => Promise<void>;
  onChangeRole: (id: string, role: string) => Promise<void>;
  onInvite: (id: string, input: StaffInviteInput) => Promise<StaffInviteResult>;
};

function StaffManager({
  staff,
  teamName,
  onAdd,
  onRemove,
  onChangeRole,
  onInvite,
}: StaffManagerProps) {
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [invitee, setInvitee] = useState<StaffMember | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  // Bumped on every open so the invite dialog remounts with fresh state — including when
  // the same member is invited twice — while `invitee` stays set through the exit animation.
  const [inviteSession, setInviteSession] = useState(0);
  const [pendingRemoval, setPendingRemoval] = useState<StaffMember | null>(null);
  const [roleTarget, setRoleTarget] = useState<StaffMember | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleSession, setRoleSession] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Roles are free text, so whatever this team has already invented becomes a suggestion
  // everywhere else — otherwise "Physio" gets retyped as "physio" and "Physiotherapist".
  const roleSuggestions = useMemo(
    () => customRolesInUse(staff.map((member) => member.role)),
    [staff]
  );

  const withAccess = staff.filter((member) => member.access_status === "active").length;
  const awaiting = staff.filter((member) => member.access_status === "invited").length;

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      if (accessFilter !== "all" && member.access_status !== accessFilter) return false;
      if (!query) return true;
      return [member.full_name, member.phone, member.email ?? "", staffRoleLabel(member.role)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [staff, search, accessFilter]);

  function handleOpenInvite(member: StaffMember) {
    setInvitee(member);
    setInviteSession((session) => session + 1);
    setInviteOpen(true);
  }

  function handleChangeRole(member: StaffMember, role: string) {
    setError(null);
    onChangeRole(member.id, role).catch(() =>
      setError(`Couldn't update ${member.full_name}'s role. Please try again.`)
    );
  }

  function handleOpenCustomRole(member: StaffMember) {
    setRoleTarget(member);
    setRoleSession((session) => session + 1);
    setRoleDialogOpen(true);
  }

  async function handleConfirmRemove() {
    if (!pendingRemoval) return;
    setError(null);
    setIsRemoving(true);
    try {
      await onRemove(pendingRemoval.id);
      setPendingRemoval(null);
    } catch {
      setError("Couldn't remove this staff member. Please try again later.");
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleCopyInviteLink(member: StaffMember) {
    if (!member.invite_url) return;
    setError(null);
    try {
      await navigator.clipboard.writeText(member.invite_url);
      setNotice(`${member.full_name}'s invite link is on your clipboard.`);
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setError("Couldn't copy the invite link. Open the invite dialog to copy it by hand.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <SummaryTile icon={Users} label="Staff" value={staff.length} />
        <SummaryTile icon={ShieldCheck} label="Has access" value={withAccess} />
        <SummaryTile icon={AlertCircle} label="Invited" value={awaiting} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search name, phone, or role"
          className="sm:flex-1"
        />

        <div className="flex items-center gap-2">
          <Select
            items={accessFilterItems}
            value={accessFilter}
            onValueChange={(value) => setAccessFilter(value as AccessFilter)}
          >
            <SelectTrigger aria-label="Filter by system access" className="h-10 flex-1 sm:w-40 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accessFilters.map((option) => (
                <SelectItem key={option} value={option}>
                  {accessFilterItems[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="lg"
            className="h-10 shrink-0"
            onClick={() => setIsAdding(true)}
          >
            <UserPlus />
            Add staff
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-sm text-foreground"
        >
          <Check className="mt-0.5 size-4 shrink-0 text-success" />
          {notice}
        </p>
      )}

      {staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff members yet."
          description="Add your coaches and managers, then invite the ones who need to sign in."
          actionLabel="Add staff member"
          onAction={() => setIsAdding(true)}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff match that."
          description="Try a different name, or clear the access filter."
        />
      ) : (
        <Stagger className="flex flex-col gap-2">
          {visible.map((member) => (
            <StaffRow
              key={member.id}
              member={member}
              roleSuggestions={roleSuggestions}
              onChangeRole={(role) => handleChangeRole(member, role)}
              onEnterCustomRole={() => handleOpenCustomRole(member)}
              onInvite={() => handleOpenInvite(member)}
              onRemove={() => setPendingRemoval(member)}
              onCopyInviteLink={() => handleCopyInviteLink(member)}
            />
          ))}
        </Stagger>
      )}

      <StaffFormDialog
        open={isAdding}
        onOpenChange={setIsAdding}
        onSubmit={onAdd}
        roleSuggestions={roleSuggestions}
      />

      <StaffRoleDialog
        key={roleSession}
        open={roleDialogOpen}
        member={roleTarget}
        onOpenChange={setRoleDialogOpen}
        onSubmit={async (role) => {
          if (roleTarget) await onChangeRole(roleTarget.id, role);
        }}
      />

      <StaffInviteDialog
        key={inviteSession}
        open={inviteOpen}
        member={invitee}
        teamName={teamName}
        onOpenChange={setInviteOpen}
        onInvite={onInvite}
      />

      <Modal
        open={!!pendingRemoval}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        title="Remove staff member?"
        description={
          pendingRemoval
            ? `${pendingRemoval.full_name} will be taken off the team and lose any system access.`
            : undefined
        }
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setPendingRemoval(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </>
        }
      />
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-card p-3 ring-1 ring-foreground/5 dark:ring-foreground/10">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <span className="font-heading text-xl font-semibold text-foreground">{value}</span>
    </div>
  );
}

export { StaffManager };

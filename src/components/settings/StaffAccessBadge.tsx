import { Badge } from "@/components/ui/badge";
import { staffAccessMeta, type StaffAccessMeta, type StaffAccessStatus } from "@/config/staff-access";

/**
 * Tolerates a missing/unknown status so a staff record persisted before access tracking
 * existed still renders instead of throwing on an undefined lookup.
 */
export function accessMeta(status: StaffAccessStatus | undefined): StaffAccessMeta {
  return (status && staffAccessMeta[status]) || staffAccessMeta.no_access;
}

function StaffAccessBadge({
  status,
  className,
}: {
  status: StaffAccessStatus | undefined;
  className?: string;
}) {
  const meta = accessMeta(status);
  const Icon = meta.icon;

  return (
    <Badge tone={meta.tone} className={className} title={meta.description}>
      <Icon aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

export { StaffAccessBadge };

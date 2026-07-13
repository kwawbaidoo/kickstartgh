import { MapPin, Shield, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { StaffMember, TeamDetailsInput } from "@/schemas/onboarding";
import { getInitials } from "@/lib/utils";

type SuccessCardProps = {
  team: Partial<TeamDetailsInput>;
  staff: StaffMember[];
};

function SuccessCard({ team, staff }: SuccessCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {team.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo} alt={`${team.name} logo`} className="size-full object-cover" />
          ) : (
            <span>{team.name ? getInitials(team.name) : "?"}</span>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-lg font-semibold text-foreground">{team.name}</span>
          {team.slogan && <span className="text-sm text-muted-foreground">&ldquo;{team.slogan}&rdquo;</span>}
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center justify-center gap-1.5">
            <MapPin className="size-4" />
            {[team.homeGround, team.region].filter(Boolean).join(", ")}
          </span>
          <span className="flex items-center justify-center gap-1.5">
            <Shield className="size-4" />
            Est. {team.yearEstablished}
          </span>
          <span className="flex items-center justify-center gap-1.5">
            <Users className="size-4" />
            {staff.length > 0
              ? `${staff.length} staff member${staff.length > 1 ? "s" : ""} added`
              : "No staff added yet"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export { SuccessCard };

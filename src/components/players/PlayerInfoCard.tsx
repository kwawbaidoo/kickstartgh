import { format } from "date-fns";
import { Cake, Footprints, Mail, MapPin, Phone, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Player } from "@/mock/players";
import { getAge } from "@/lib/players";

type PlayerInfoCardProps = {
  player: Player;
};

function PlayerInfoCard({ player }: PlayerInfoCardProps) {
  const rows = [
    {
      icon: Cake,
      label: "Date of birth",
      value: `${format(new Date(player.dateOfBirth), "d MMM yyyy")} (age ${getAge(player.dateOfBirth)})`,
    },
    { icon: Phone, label: "Phone", value: player.phone || "Not provided" },
    { icon: Mail, label: "Email", value: player.email || "Not provided" },
    { icon: MapPin, label: "Location", value: player.village || "Not provided" },
    { icon: Footprints, label: "Preferred foot", value: player.preferredFoot },
  ];

  const emergencyContactRows = [
    { icon: User, label: "Name", value: player.emergencyContact?.name || "Not provided" },
    { icon: Phone, label: "Phone", value: player.emergencyContact?.phone || "Not provided" },
    { icon: Mail, label: "Email", value: player.emergencyContact?.email || "Not provided" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <row.icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-muted-foreground">{row.label}</span>
            <span className="font-medium text-foreground">{row.value}</span>
          </div>
        ))}

        <Separator className="my-1" />

        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Emergency Contact
        </span>

        {emergencyContactRows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <row.icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-muted-foreground">{row.label}</span>
            <span className="font-medium text-foreground">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { PlayerInfoCard };

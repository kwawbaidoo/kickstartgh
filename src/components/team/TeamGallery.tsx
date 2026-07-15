import { GalleryTile } from "@/components/team/GalleryTile";
import { staffRoleOptions } from "@/config/roles";
import type { StaffMember } from "@/schemas/onboarding";
import type { Player } from "@/mock/players";

type TeamGalleryProps = {
  staff: StaffMember[];
  players: Player[];
};

function TeamGallery({ staff, players }: TeamGalleryProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Staff</h3>
        {staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff added yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {staff.map((member) => (
              <GalleryTile
                key={member.id}
                name={member.fullName}
                identification={
                  staffRoleOptions.find((option) => option.value === member.role)?.label ?? "Staff"
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Players</h3>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">No players added yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {players.map((player) => (
              <GalleryTile
                key={player.id}
                photo={player.photo}
                name={player.fullName}
                identification={player.position}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { TeamGallery };

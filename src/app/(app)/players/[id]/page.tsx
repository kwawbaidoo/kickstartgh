"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Ban,
  CircleCheck,
  Flag,
  HeartPulse,
  MessageCircle,
  Moon,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PlayerProfileHeader } from "@/components/players/PlayerProfileHeader";
import { PlayerInfoCard } from "@/components/players/PlayerInfoCard";
import { PlayerStatsCard } from "@/components/players/PlayerStatsCard";
import { PlayerStatusControl } from "@/components/players/PlayerStatusControl";
import { Modal } from "@/components/common/Modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlayerStatus } from "@/mock/players";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getPlayerMatchStats } from "@/lib/matches";
import { getPlayerAttendanceStats } from "@/lib/attendance";

const statusTimelineIcon: Record<PlayerStatus, typeof CircleCheck> = {
  Active: CircleCheck,
  Injured: HeartPulse,
  Inactive: Moon,
  Suspended: Ban,
};

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const players = usePlayersStore((state) => state.players);
  const deletePlayer = usePlayersStore((state) => state.deletePlayer);
  const matches = useMatchesStore((state) => state.matches);
  const sessions = useAttendanceStore((state) => state.sessions);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const player = players.find((candidate) => candidate.id === id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!player) {
    return (
      <EmptyState
        icon={UserPlus}
        title="Player not found."
        description="This player may have been removed."
        actionLabel="Back to squad"
        actionHref="/players"
      />
    );
  }

  const shareMessage = [
    "⚽ Player Profile",
    "",
    "Name:",
    player.fullName,
    "",
    "Position:",
    player.position,
    "",
    "Team:",
    teamName,
  ].join("\n");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const matchStats = getPlayerMatchStats(player.id, matches);
  const attendanceStats = getPlayerAttendanceStats(player.id, sessions, matches);
  const statsForCard = {
    ...matchStats,
    attendancePercentage: attendanceStats.attendancePercentage,
    rating: player.stats.rating,
  };

  const firstAppearance = matches
    .filter((match) => match.status === "completed")
    .filter(
      (match) =>
        match.lineup?.startingXI.includes(player.id) ||
        match.events.some(
          (event) => event.type === "substitution" && event.playerInId === player.id
        )
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const statusEvents = player.statusHistory.slice(1).map((change) => ({
    icon: statusTimelineIcon[change.status],
    label: `Marked as ${change.status}`,
    date: format(new Date(change.date), "d MMM yyyy"),
  }));

  const timeline = [
    {
      icon: UserPlus,
      label: "Joined team",
      date: format(new Date(player.createdAt), "d MMM yyyy"),
    },
    ...statusEvents,
    { icon: Flag, label: "Registered for season", date: "Pending" },
    {
      icon: CircleCheck,
      label: "Played first match",
      date: firstAppearance ? format(new Date(firstAppearance.date), "d MMM yyyy") : "Pending",
    },
  ];

  function handleDelete() {
    deletePlayer(id);
    router.push("/players");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/players"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Players
      </Link>

      <PlayerProfileHeader player={player} />

      <PlayerStatusControl playerId={player.id} status={player.status} />

      <div className="flex flex-wrap gap-2">
        <Link href={`/players/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
          <Pencil />
          Edit Player
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          <MessageCircle />
          Share Player Profile
        </a>
        <Modal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button variant="destructive">
              <Trash2 />
              Remove Player
            </Button>
          }
          title="Remove this player?"
          description={`${player.fullName} will be removed from your squad. This can't be undone.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Remove Player
              </Button>
            </>
          }
        />
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="pt-4">
          <PlayerInfoCard player={player} />
        </TabsContent>

        <TabsContent value="stats" className="pt-4">
          <PlayerStatsCard stats={statsForCard} />
        </TabsContent>

        <TabsContent value="timeline" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
              {timeline.map((item, index) => (
                <div key={`${item.label}-${item.date}-${index}`} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <item.icon className="size-4" />
                    </div>
                    {index < timeline.length - 1 && <div className="mt-1 h-6 w-px bg-border" />}
                  </div>
                  <div className="flex flex-col pt-1.5">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Ban,
  CircleCheck,
  Download,
  Flag,
  Footprints,
  HeartPulse,
  MessageCircle,
  Moon,
  Pencil,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PlayerPhotoPanel } from "@/components/players/PlayerPhotoPanel";
import { PlayerProfileHeader } from "@/components/players/PlayerProfileHeader";
import { PlayerInfoCard } from "@/components/players/PlayerInfoCard";
import { PlayerStatsCard } from "@/components/players/PlayerStatsCard";
import { PlayerStatusControl } from "@/components/players/PlayerStatusControl";
import { Modal } from "@/components/common/Modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlayerStatus } from "@/mock/players";
import { eventTypeConfig } from "@/config/matches";
import { usePlayersStore } from "@/store/players-store";
import { useMatchesStore } from "@/store/matches-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getPlayerMatchStats } from "@/lib/matches";
import { getPlayerAttendanceStats } from "@/lib/attendance";
import {
  buildPlayerTimeline,
  filterTimelineByPeriod,
  getTimelinePeriodOptions,
  timelineGranularityOptions,
  type PlayerTimelineEventType,
  type TimelineGranularity,
} from "@/lib/players";
import { exportPlayerMatchReportPdf } from "@/lib/export";
import { useOrigin } from "@/hooks/useOrigin";
import { cn } from "@/lib/utils";

const statusTimelineIcon: Record<PlayerStatus, LucideIcon> = {
  Active: CircleCheck,
  Injured: HeartPulse,
  Inactive: Moon,
  Suspended: Ban,
};

const timelineTypeConfig: Record<PlayerTimelineEventType, { icon: LucideIcon; colorClass: string }> = {
  joined: { icon: UserPlus, colorClass: "bg-muted text-muted-foreground" },
  status: { icon: Flag, colorClass: "bg-muted text-muted-foreground" },
  match: { icon: CircleCheck, colorClass: "bg-primary/10 text-primary" },
  goal: { icon: eventTypeConfig.goal.icon, colorClass: eventTypeConfig.goal.colorClass },
  assist: { icon: Footprints, colorClass: "bg-secondary text-secondary-foreground" },
  yellow_card: { icon: eventTypeConfig.yellow_card.icon, colorClass: eventTypeConfig.yellow_card.colorClass },
  red_card: { icon: eventTypeConfig.red_card.icon, colorClass: eventTypeConfig.red_card.colorClass },
};

const timelineGranularityLabels: Record<TimelineGranularity, string> = {
  all: "All time",
  year: "By year",
  quarter: "By quarter",
  month: "By month",
};

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const players = usePlayersStore((state) => state.players);
  const deletePlayer = usePlayersStore((state) => state.deletePlayer);
  const matches = useMatchesStore((state) => state.matches);
  const sessions = useAttendanceStore((state) => state.sessions);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const player = players.find((candidate) => candidate.id === id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [granularity, setGranularity] = useState<TimelineGranularity>("all");
  const [period, setPeriod] = useState<string | null>(null);
  const origin = useOrigin();
  const publicProfileUrl = origin ? `${origin}/players/${id}/profile` : "";

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
    `⚽ ${player.fullName} — Player Profile`,
    "",
    `${player.position}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""} · ${activeTeam.name}`,
    "",
    "View full profile:",
    publicProfileUrl,
  ].join("\n");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const matchStats = getPlayerMatchStats(player.id, matches);
  const attendanceStats = getPlayerAttendanceStats(player.id, sessions, matches);
  const statsForCard = {
    ...matchStats,
    attendancePercentage: attendanceStats.attendancePercentage,
    rating: player.stats.rating,
  };

  const timeline = buildPlayerTimeline(player, matches);
  const periodOptions = getTimelinePeriodOptions(timeline, granularity);
  const filteredTimeline = filterTimelineByPeriod(timeline, granularity, period);

  function handleDelete() {
    deletePlayer(id);
    router.push("/players");
  }

  function handleGranularityChange(next: TimelineGranularity) {
    setGranularity(next);
    setPeriod(getTimelinePeriodOptions(timeline, next)[0]?.value ?? null);
  }

  function handleDownloadMatchReport(matchId: string) {
    if (!player) return;
    const match = matches.find((candidate) => candidate.id === matchId);
    if (!match) return;
    exportPlayerMatchReportPdf(player, match, activeTeam);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:w-72 lg:shrink-0">
        <Link
          href="/players"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Players
        </Link>
        <PlayerPhotoPanel player={player} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
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
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    items={timelineGranularityLabels}
                    value={granularity}
                    onValueChange={(value) =>
                      handleGranularityChange((value as TimelineGranularity | null) ?? "all")
                    }
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timelineGranularityOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {timelineGranularityLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {granularity !== "all" && periodOptions.length > 0 && (
                    <Select
                      items={Object.fromEntries(periodOptions.map((option) => [option.value, option.label]))}
                      value={period ?? periodOptions[0].value}
                      onValueChange={(value) => setPeriod(value ?? periodOptions[0].value)}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
                  {filteredTimeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity in this period.</p>
                  ) : (
                    filteredTimeline.map((item, index) => {
                      const Icon =
                        item.type === "status" && item.status
                          ? statusTimelineIcon[item.status]
                          : timelineTypeConfig[item.type].icon;
                      return (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-full",
                                timelineTypeConfig[item.type].colorClass
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            {index < filteredTimeline.length - 1 && (
                              <div className="mt-1 h-6 w-px bg-border" />
                            )}
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-2 pt-1.5">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{item.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(item.date), "d MMM yyyy")}
                              </span>
                            </div>
                            {item.type === "match" && item.matchId && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Download match report — ${item.label}`}
                                onClick={() => handleDownloadMatchReport(item.matchId!)}
                              >
                                <Download className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

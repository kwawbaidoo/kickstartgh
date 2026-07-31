"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AttendanceBoard } from "@/components/training/AttendanceBoard";
import { Button } from "@/components/ui/button";
import { usePlayersStore } from "@/store/players-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { getSeasonRecord, getSeasonRoster } from "@/lib/players";

export default function TrainingAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const sessions = useAttendanceStore((state) => state.sessions);
  const setAttendance = useAttendanceStore((state) => state.setAttendance);
  const setBulkAttendance = useAttendanceStore((state) => state.setBulkAttendance);
  const completeSession = useAttendanceStore((state) => state.completeSession);
  const players = usePlayersStore((state) => state.players);
  const session = sessions.find((candidate) => candidate.id === id);

  if (!session) {
    return (
      <EmptyState
        title="Session not found."
        description="This training session may have been removed."
        actionLabel="Back to training"
        actionHref="/training"
      />
    );
  }

  const activePlayers = getSeasonRoster(players, session.seasonId).filter(
    (player) => getSeasonRecord(player, session.seasonId)?.status === "Active"
  );

  function handleFinish() {
    completeSession(id);
    router.push(`/training/${id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-20 lg:pb-16">
      <Link
        href={`/training/${id}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Session
      </Link>
      <SectionHeader title="Take Attendance" description={session.title} />

      <AttendanceBoard
        players={activePlayers}
        records={session.records}
        onSetAttendance={(playerId, status) => setAttendance(id, playerId, status)}
        onSetBulkAttendance={(playerIds, status) => setBulkAttendance(id, playerIds, status)}
      />

      <div
        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:sticky lg:inset-x-auto lg:bottom-4 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
      >
        <Button size="lg" className="mx-auto w-full max-w-2xl" onClick={handleFinish}>
          Finish &amp; Save
        </Button>
      </div>
    </div>
  );
}

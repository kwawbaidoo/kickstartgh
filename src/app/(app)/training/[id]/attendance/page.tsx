"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AttendanceBoard } from "@/components/training/AttendanceBoard";
import { Button } from "@/components/ui/button";
import { usePlayersStore } from "@/store/players-store";
import { useAttendanceStore } from "@/store/attendance-store";

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

  const activePlayers = players.filter((player) => player.status === "Active");

  function handleFinish() {
    completeSession(id);
    router.push(`/training/${id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Take Attendance" description={session.title} />

      <AttendanceBoard
        players={activePlayers}
        records={session.records}
        onSetAttendance={(playerId, status) => setAttendance(id, playerId, status)}
        onSetBulkAttendance={(playerIds, status) => setBulkAttendance(id, playerIds, status)}
      />

      <Button size="lg" className="w-full" onClick={handleFinish}>
        Finish &amp; Save
      </Button>
    </div>
  );
}

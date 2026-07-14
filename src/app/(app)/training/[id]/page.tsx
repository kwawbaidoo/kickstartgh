"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarClock,
  FileBarChart,
  ListChecks,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Modal } from "@/components/common/Modal";
import { ReminderCard } from "@/components/training/ReminderCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trainingFocusIcon } from "@/config/training";
import { usePlayersStore } from "@/store/players-store";
import { useAttendanceStore } from "@/store/attendance-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import {
  buildTrainingReminderMessage,
  buildTrainingShareMessage,
  getSessionAttendanceSummary,
} from "@/lib/training";

export default function TrainingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const sessions = useAttendanceStore((state) => state.sessions);
  const deleteSession = useAttendanceStore((state) => state.deleteSession);
  const cancelSession = useAttendanceStore((state) => state.cancelSession);
  const players = usePlayersStore((state) => state.players);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const session = sessions.find((candidate) => candidate.id === id);

  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!session) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Session not found."
        description="This training session may have been removed."
        actionLabel="Back to training"
        actionHref="/training"
      />
    );
  }

  const FocusIcon = session.focus ? trainingFocusIcon[session.focus] : null;
  const headCoach = activeTeam.staff.find((member) => member.role === "headCoach")?.fullName;
  const summary = getSessionAttendanceSummary(session, players);
  const shareMessage = buildTrainingShareMessage(session, activeTeam.name);
  const reminderMessage = buildTrainingReminderMessage(session, activeTeam.name);

  function handleDelete() {
    deleteSession(id);
    router.push("/training");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Training Session" />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              {FocusIcon && <FocusIcon className="size-3.5" />}
              {session.focus ?? "Training"}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
              {session.status}
            </span>
          </div>

          <h1 className="font-heading text-xl font-semibold text-foreground">{session.title}</h1>

          <div className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              {format(new Date(session.date), "EEE, d MMM yyyy")} · {session.startTime}–{session.endTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {session.venue}
            </span>
            {headCoach && <span>Coach: {headCoach}</span>}
          </div>

          {session.description && <p className="text-sm text-muted-foreground">{session.description}</p>}

          {session.equipment && session.equipment.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {session.equipment.map((item) => (
                <span key={item} className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                  {item}
                </span>
              ))}
            </div>
          )}

          {session.notes && (
            <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{session.notes}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href={`/training/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
          <Pencil />
          Edit
        </Link>
        <Link href={`/training/${id}/attendance`} className={buttonVariants({ variant: "outline" })}>
          <ListChecks />
          Take Attendance
        </Link>
        <Link href="/reports/attendance" className={buttonVariants({ variant: "outline" })}>
          <FileBarChart />
          Attendance Report
        </Link>
        <Modal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button variant="destructive">
              <Trash2 />
              Delete Session
            </Button>
          }
          title="Delete this session?"
          description={`${session.title} will be removed. This can't be undone.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Session
              </Button>
            </>
          }
        />
      </div>

      {session.status === "upcoming" && (
        <Button variant="ghost" className="self-start" onClick={() => cancelSession(id)}>
          Cancel Session
        </Button>
      )}

      {session.status === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[
                { label: "Present", value: summary.present },
                { label: "Late", value: summary.late },
                { label: "Excused", value: summary.excused },
                { label: "Injured", value: summary.injured },
                { label: "Absent", value: summary.absent },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                  <span className="font-heading text-lg font-semibold text-foreground">{item.value}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <SectionHeader title={session.status === "upcoming" ? "Send Reminder" : "Share Session"} />
        <ReminderCard message={session.status === "upcoming" ? reminderMessage : shareMessage} />
      </div>
    </div>
  );
}

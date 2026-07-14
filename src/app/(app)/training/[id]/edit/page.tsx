"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TrainingForm } from "@/components/training/TrainingForm";
import { useAttendanceStore } from "@/store/attendance-store";
import type { TrainingFormInput } from "@/schemas/training";

export default function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const sessions = useAttendanceStore((state) => state.sessions);
  const updateSession = useAttendanceStore((state) => state.updateSession);
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

  function handleSubmit(data: TrainingFormInput) {
    updateSession(id, data);
    router.push(`/training/${id}`);
  }

  const defaultValues: Partial<TrainingFormInput> = {
    title: session.title,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    venue: session.venue,
    description: session.description,
    focus: session.focus,
    equipment: session.equipment,
    notes: session.notes,
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Edit Session" description={`Update details for ${session.title}.`} />
      <TrainingForm defaultValues={defaultValues} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}

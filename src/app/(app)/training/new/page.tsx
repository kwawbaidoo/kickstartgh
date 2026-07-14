"use client";

import { useRouter } from "next/navigation";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TrainingForm } from "@/components/training/TrainingForm";
import { useAttendanceStore } from "@/store/attendance-store";
import type { TrainingFormInput } from "@/schemas/training";

export default function NewTrainingPage() {
  const router = useRouter();
  const addSession = useAttendanceStore((state) => state.addSession);

  function handleSubmit(data: TrainingFormInput) {
    const session = addSession(data);
    router.push(`/training/${session.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Schedule Training" description="Set up a new training session." />
      <TrainingForm onSubmit={handleSubmit} submitLabel="Schedule Session" />
    </div>
  );
}

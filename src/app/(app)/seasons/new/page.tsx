"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { SeasonForm } from "@/components/seasons/SeasonForm";
import { useSeasonStore } from "@/store/season-store";
import type { SeasonFormInput } from "@/schemas/season";

export default function NewSeasonPage() {
  const router = useRouter();
  const addSeason = useSeasonStore((state) => state.addSeason);

  function handleSubmit(data: SeasonFormInput) {
    const season = addSeason(data);
    router.push(`/seasons/${season.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/seasons"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Seasons
      </Link>
      <SectionHeader title="Create Season" description="Set up a new season for your club." />
      <SeasonForm onSubmit={handleSubmit} submitLabel="Create Season" />
    </div>
  );
}

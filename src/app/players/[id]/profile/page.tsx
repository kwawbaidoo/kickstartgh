"use client";

import { use, useEffect } from "react";
import { MessageCircle } from "lucide-react";

import { PlayerPhotoPanel } from "@/components/players/PlayerPhotoPanel";
import { PlayerMarketabilityDetails } from "@/components/players/PlayerMarketabilityDetails";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { statusBadgeClasses } from "@/config/players";
import { usePlayersStore } from "@/store/players-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useOrigin } from "@/hooks/useOrigin";
import { cn, getInitials } from "@/lib/utils";

/**
 * Public, unauthenticated shareable profile — no app chrome, no CV download,
 * only the details that make a player marketable (see
 * PlayerMarketabilityDetails). This is what a "Share Player Profile" link
 * opens for anyone outside the team, e.g. a scout following a WhatsApp link.
 */
export default function PublicPlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const players = usePlayersStore((state) => state.players);
  const playersHydrated = usePlayersStore((state) => state.hasHydrated);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const teamHydrated = useOnboardingStore((state) => state.hasHydrated);
  const origin = useOrigin();
  const pageUrl = origin ? `${origin}/players/${id}/profile` : "";

  useEffect(() => {
    usePlayersStore.persist.rehydrate();
    useOnboardingStore.persist.rehydrate();
  }, []);

  const hasHydrated = playersHydrated && teamHydrated;
  const player = players.find((candidate) => candidate.id === id);

  if (!hasHydrated) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
        <LoadingSkeleton className="aspect-4/5 w-full rounded-2xl lg:w-80 lg:shrink-0" />
        <div className="flex flex-1 flex-col gap-4">
          <LoadingSkeleton className="h-8 w-1/2" />
          <LoadingSkeleton className="h-32 w-full rounded-lg" />
          <LoadingSkeleton className="h-24 w-full rounded-lg" />
        </div>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">Profile not found.</h1>
        <p className="text-sm text-muted-foreground">
          This player profile may have been removed, or the link is incorrect.
        </p>
      </main>
    );
  }

  const shareMessage = [
    `⚽ ${player.fullName} — Player Profile`,
    "",
    `${player.position}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""} · ${activeTeam.name}`,
    "",
    pageUrl,
  ].join("\n");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:py-10">
      <div className="flex flex-col gap-4 lg:sticky lg:top-10 lg:w-80 lg:shrink-0">
        <PlayerPhotoPanel player={player} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {activeTeam.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeTeam.logo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(activeTeam.name)
            )}
          </div>
          <span className="text-sm font-medium text-accent">{activeTeam.name}</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-3xl font-semibold text-foreground">{player.fullName}</h1>
            {player.nickname && (
              <span className="text-base font-normal text-muted-foreground">
                &ldquo;{player.nickname}&rdquo;
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                statusBadgeClasses[player.status]
              )}
            >
              {player.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {player.position}
            {player.secondaryPosition && ` / ${player.secondaryPosition}`}
            {" · "}#{player.jerseyNumber}
          </p>
        </div>

        <PlayerMarketabilityDetails player={player} />

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
        >
          <MessageCircle />
          Share via WhatsApp
        </a>

        <p className="pb-6 text-center text-xs text-muted-foreground">Powered by KickStartGH</p>
      </div>
    </main>
  );
}

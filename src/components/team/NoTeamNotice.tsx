"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Loader2, RefreshCw, Settings, ShieldQuestion } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";

/** Shown once per browser session, so moving around Settings doesn't re-announce it. */
const SEEN_KEY = "kickstartgh-no-team-notice-seen";

function useRecheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkedWithoutTeam, setCheckedWithoutTeam] = useState(false);

  async function recheck() {
    setIsChecking(true);
    setCheckedWithoutTeam(false);
    try {
      const teamId = await useAuthStore.getState().fetchCurrentUser();
      await useOnboardingStore.getState().adoptServerTeam(teamId);
      // A successful adopt re-renders the gate away, so reaching here means still no team.
      if (!useOnboardingStore.getState().team_id) setCheckedWithoutTeam(true);
    } catch {
      setCheckedWithoutTeam(true);
    } finally {
      setIsChecking(false);
    }
  }

  return { isChecking, checkedWithoutTeam, recheck };
}

/**
 * The dismissible announcement. Deliberately separate from `NoTeamScreen` — the modal is
 * the one-time "here's why the app looks empty", the screen is the persistent explanation
 * you land on whenever you open something team-scoped.
 */
function NoTeamModal() {
  // Read in the initialiser rather than an effect: an effect that opens the modal on mount
  // is a cascading render, and there's nothing to synchronise — the answer is known up
  // front. Guarded for SSR, though `AuthGuard` means this never renders on the server.
  const [open, setOpen] = useState(
    () => typeof window !== "undefined" && !sessionStorage.getItem(SEEN_KEY)
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) sessionStorage.setItem(SEEN_KEY, "1");
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="You're not on a team yet"
      description="Your account is active, but it isn't linked to a team — so there's no squad, no matches and no reports to show."
      footer={
        <>
          <Link
            href="/settings/profile"
            onClick={() => handleOpenChange(false)}
            className={buttonVariants({ variant: "outline" })}
          >
            <Settings />
            Go to Settings
          </Link>
          <Button type="button" onClick={() => handleOpenChange(false)}>
            Got it
          </Button>
        </>
      }
    >
      <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
        Ask your team owner to set the team up in KickStartGH and invite you. Until then you can
        still update your own profile, preferences and password.
      </p>
    </Modal>
  );
}

/** Rendered in place of any team-scoped page while the user has no team. */
function NoTeamScreen() {
  const fullName = useAuthStore((state) => state.user?.full_name);
  const phone = useAuthStore((state) => state.user?.phone);
  const email = useAuthStore((state) => state.user?.email);
  const { isChecking, checkedWithoutTeam, recheck } = useRecheck();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 py-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-5 py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-warning/10 text-warning">
            <ShieldQuestion className="size-7" aria-hidden="true" />
          </span>

          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-lg font-semibold text-foreground">
              Your team isn&apos;t set up yet
            </h1>
            <p className="text-sm text-muted-foreground">
              {fullName ? `${fullName.split(" ")[0]}, your` : "Your"} account works, but it
              isn&apos;t linked to a team. Ask your team owner to create the team in KickStartGH
              and invite you — everything here unlocks as soon as they do.
            </p>
          </div>

          <div className="flex w-full flex-col gap-1 rounded-xl bg-muted/60 p-3 text-left">
            <span className="text-xs font-medium text-foreground">
              Give them these details so they invite the right account:
            </span>
            <span className="text-sm text-muted-foreground">{phone}</span>
            {email && <span className="text-sm text-muted-foreground">{email}</span>}
          </div>

          {checkedWithoutTeam && (
            <p role="status" className="text-sm text-muted-foreground">
              Still no team linked to your account.
            </p>
          )}

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={recheck}
              disabled={isChecking}
            >
              {isChecking ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {isChecking ? "Checking..." : "Check again"}
            </Button>
            <Link
              href="/settings/profile"
              className={buttonVariants({ variant: "outline", size: "lg", className: "flex-1" })}
            >
              <Settings />
              My settings
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="flex items-start gap-2 px-2 text-xs text-muted-foreground">
        <Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Meant to be running your own team? Ask us to switch your account to a team owner and
        you&apos;ll be able to create one yourself.
      </p>
    </div>
  );
}

export { NoTeamModal, NoTeamScreen };

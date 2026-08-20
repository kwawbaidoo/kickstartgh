"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { NoTeamModal, NoTeamScreen } from "@/components/team/NoTeamNotice";
import { pathRequiresTeam } from "@/config/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";

/**
 * Decides what a signed-in user without a team sees. Sits inside `AppShell` so the chrome
 * (and the reduced nav) stays put, and runs after `AuthGuard`, so a session and a settled
 * password are already guaranteed.
 *
 * - **Team owner, no team** → the onboarding wizard. They create the team before the
 *   dashboard is reachable.
 * - **Anyone else, no team** → the team-scoped page is replaced by `NoTeamScreen`, plus a
 *   one-time modal. Settings still works, because none of it is team-scoped.
 *
 * Waits for `teamResolved` rather than acting on `team_id` alone: that flag is only true
 * once `GET /me` has reported membership, and without it a locally-cached null would
 * briefly read as "no team" and push an owner who has one into making a second.
 */
function TeamGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const teamResolved = useOnboardingStore((state) => state.teamResolved);
  const teamId = useOnboardingStore((state) => state.team_id);
  const isTeamOwner = useAuthStore((state) => state.user?.is_team_owner === true);

  const needsTeam = teamResolved && !teamId;
  const shouldCreateTeam = needsTeam && isTeamOwner;

  useEffect(() => {
    if (shouldCreateTeam) router.replace("/onboarding");
  }, [shouldCreateTeam, router]);

  if (!teamResolved || shouldCreateTeam) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSkeleton className="size-10 rounded-full" />
      </div>
    );
  }

  if (needsTeam) {
    return (
      <>
        <NoTeamModal />
        {pathRequiresTeam(pathname) ? <NoTeamScreen /> : children}
      </>
    );
  }

  return <>{children}</>;
}

export { TeamGate };

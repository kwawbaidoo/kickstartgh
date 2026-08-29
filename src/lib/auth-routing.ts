import { useAuthStore, teamIdFromUser } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";

/**
 * Where a signed-in user belongs, in priority order:
 *
 * 1. Still on a provisioned temporary password → set a real one first.
 * 2. Has a team → the app proper.
 * 3. No team, and is the team owner → the onboarding wizard to create one.
 * 4. No team, and isn't → the app, where `TeamGate` explains they need their owner to set
 *    the team up. Deliberately not a dedicated route: the moment a team appears they're
 *    already where they should be, with no second redirect.
 *
 * Shared by every entry point (sign-in, the first-login screen, and the already-signed-in
 * bounce on `/`) so they can't drift apart.
 */
export function postSignInPath(): string {
  const user = useAuthStore.getState().user;
  if (user?.must_change_password) return "/auth/first-login";

  const teamId = useOnboardingStore.getState().team_id ?? (user ? teamIdFromUser({ currentTeamId: user.current_team_id }) : null);
  if (teamId) return "/dashboard";

  return user?.is_team_owner ? "/onboarding" : "/dashboard";
}

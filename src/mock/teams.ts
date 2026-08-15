export type Team = {
  id: string;
  name: string;
  nickname: string;
  region: string;
  district: string;
  home_ground: string;
  year_established: number;
  head_coach: string;
  logo_initials: string;
};

/**
 * Blank until Sprint I2's saveTeam() (POST/PATCH /teams) overwrites it with the real
 * team — see src/store/onboarding-store.ts's activeTeam. Not visible in normal use:
 * AuthGuard gates onboarding/dashboard behind a signed-in session, and the team step
 * runs before any page that would display this.
 */
export const currentTeam: Team = {
  id: "",
  name: "",
  nickname: "",
  region: "",
  district: "",
  home_ground: "",
  year_established: 0,
  head_coach: "",
  logo_initials: "",
};

export const teams: Team[] = [];

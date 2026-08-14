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

export const currentTeam: Team = {
  id: "team_001",
  name: "Osagyefo FC",
  nickname: "The Lions",
  region: "Western Region",
  district: "Ellembelle",
  home_ground: "Community Park",
  year_established: 2018,
  head_coach: "Coach Kojo Boateng",
  logo_initials: "OFC",
};

export const teams: Team[] = [currentTeam];

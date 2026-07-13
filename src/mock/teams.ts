export type Team = {
  id: string;
  name: string;
  nickname: string;
  region: string;
  district: string;
  homeGround: string;
  yearEstablished: number;
  headCoach: string;
  logoInitials: string;
};

export const currentTeam: Team = {
  id: "team_001",
  name: "Osagyefo FC",
  nickname: "The Lions",
  region: "Western Region",
  district: "Ellembelle",
  homeGround: "Community Park",
  yearEstablished: 2018,
  headCoach: "Coach Kojo Boateng",
  logoInitials: "OFC",
};

export const teams: Team[] = [currentTeam];

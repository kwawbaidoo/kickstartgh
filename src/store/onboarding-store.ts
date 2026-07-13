import { create } from "zustand";

import type { RoleId } from "@/config/roles";
import type { StaffMember, TeamDetailsInput } from "@/schemas/onboarding";
import { currentTeam } from "@/mock/teams";
import { getInitials } from "@/lib/utils";

export type ActiveTeam = {
  name: string;
  nickname: string;
  region: string;
  district: string;
  homeGround: string;
  yearEstablished: number;
  logo?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  slogan?: string;
  staff: StaffMember[];
};

type OnboardingDraft = {
  role: RoleId | null;
  team: Partial<TeamDetailsInput>;
  staff: StaffMember[];
  inviteCode: string | null;
};

type OnboardingState = {
  hasOnboarded: boolean;
  activeTeam: ActiveTeam;
  draft: OnboardingDraft;
  setRole: (role: RoleId) => void;
  setTeamDetails: (team: TeamDetailsInput) => void;
  addStaffMember: (member: StaffMember) => void;
  removeStaffMember: (id: string) => void;
  setInviteCode: (code: string) => void;
  completeOnboarding: () => void;
  resetDraft: () => void;
};

const initialDraft: OnboardingDraft = {
  role: null,
  team: {},
  staff: [],
  inviteCode: null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasOnboarded: false,
  activeTeam: {
    name: currentTeam.name,
    nickname: currentTeam.nickname,
    region: currentTeam.region,
    district: currentTeam.district,
    homeGround: currentTeam.homeGround,
    yearEstablished: currentTeam.yearEstablished,
    staff: [],
  },
  draft: initialDraft,

  setRole: (role) => set((state) => ({ draft: { ...state.draft, role } })),

  setTeamDetails: (team) => set((state) => ({ draft: { ...state.draft, team } })),

  addStaffMember: (member) =>
    set((state) => ({ draft: { ...state.draft, staff: [...state.draft.staff, member] } })),

  removeStaffMember: (id) =>
    set((state) => ({
      draft: { ...state.draft, staff: state.draft.staff.filter((member) => member.id !== id) },
    })),

  setInviteCode: (inviteCode) => set((state) => ({ draft: { ...state.draft, inviteCode } })),

  completeOnboarding: () => {
    const { team, staff } = get().draft;
    if (!team.name) return;

    set({
      hasOnboarded: true,
      activeTeam: {
        name: team.name,
        nickname: team.nickname || getInitials(team.name),
        region: team.region ?? "",
        district: team.district ?? "",
        homeGround: team.homeGround ?? "",
        yearEstablished: team.yearEstablished ?? new Date().getFullYear(),
        logo: team.logo,
        colorPrimary: team.colorPrimary,
        colorSecondary: team.colorSecondary,
        slogan: team.slogan,
        staff,
      },
    });
  },

  resetDraft: () => set({ draft: initialDraft }),
}));

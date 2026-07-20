import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  coverImage?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  slogan?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  staff: StaffMember[];
  photos: string[];
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
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setRole: (role: RoleId) => void;
  setTeamDetails: (team: TeamDetailsInput) => void;
  addStaffMember: (member: StaffMember) => void;
  removeStaffMember: (id: string) => void;
  setInviteCode: (code: string) => void;
  completeOnboarding: () => void;
  resetDraft: () => void;
  updateTeam: (team: TeamDetailsInput) => void;
  addActiveStaffMember: (member: StaffMember) => void;
  removeActiveStaffMember: (id: string) => void;
  updateActiveStaffMemberRole: (id: string, role: RoleId) => void;
  addTeamPhoto: (photo: string) => void;
  removeTeamPhoto: (photo: string) => void;
};

const initialDraft: OnboardingDraft = {
  role: null,
  team: {},
  staff: [],
  inviteCode: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
  hasOnboarded: false,
  activeTeam: {
    name: currentTeam.name,
    nickname: currentTeam.nickname,
    region: currentTeam.region,
    district: currentTeam.district,
    homeGround: currentTeam.homeGround,
    yearEstablished: currentTeam.yearEstablished,
    staff: [],
    photos: [],
  },
  draft: initialDraft,
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),

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
        coverImage: team.coverImage,
        colorPrimary: team.colorPrimary,
        colorSecondary: team.colorSecondary,
        slogan: team.slogan,
        facebook: team.facebook,
        instagram: team.instagram,
        tiktok: team.tiktok,
        website: team.website,
        staff,
        photos: [],
      },
    });
  },

  resetDraft: () => set({ draft: initialDraft }),

  updateTeam: (team) =>
    set((state) => ({
      activeTeam: {
        ...state.activeTeam,
        ...team,
        nickname: team.nickname || state.activeTeam.nickname,
      },
    })),

  addActiveStaffMember: (member) =>
    set((state) => ({
      activeTeam: { ...state.activeTeam, staff: [...state.activeTeam.staff, member] },
    })),

  removeActiveStaffMember: (id) =>
    set((state) => ({
      activeTeam: {
        ...state.activeTeam,
        staff: state.activeTeam.staff.filter((member) => member.id !== id),
      },
    })),

  updateActiveStaffMemberRole: (id, role) =>
    set((state) => ({
      activeTeam: {
        ...state.activeTeam,
        staff: state.activeTeam.staff.map((member) =>
          member.id === id ? { ...member, role } : member
        ),
      },
    })),

  addTeamPhoto: (photo) =>
    set((state) => ({
      activeTeam: { ...state.activeTeam, photos: [...state.activeTeam.photos, photo] },
    })),

  removeTeamPhoto: (photo) =>
    set((state) => ({
      activeTeam: {
        ...state.activeTeam,
        photos: state.activeTeam.photos.filter((existing) => existing !== photo),
      },
    })),
    }),
    {
      name: "kickstartgh-onboarding",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

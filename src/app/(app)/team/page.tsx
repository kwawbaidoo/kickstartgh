"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AtSign,
  CalendarDays,
  Globe,
  Link2,
  MapPin,
  Music2,
  Pencil,
} from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffManager } from "@/components/settings/StaffManager";
import { PermissionTable } from "@/components/settings/PermissionTable";
import { TeamGallery } from "@/components/team/TeamGallery";
import { useOnboardingStore } from "@/store/onboarding-store";
import { usePlayersStore } from "@/store/players-store";
import { fadeInUp } from "@/lib/motion";
import { getInitials } from "@/lib/utils";

const socialLinks = [
  { key: "facebook", label: "Facebook", icon: Link2 },
  { key: "instagram", label: "Instagram", icon: AtSign },
  { key: "tiktok", label: "TikTok", icon: Music2 },
  { key: "website", label: "Website", icon: Globe },
] as const;

export default function TeamPage() {
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const addActiveStaffMember = useOnboardingStore((state) => state.addActiveStaffMember);
  const removeActiveStaffMember = useOnboardingStore((state) => state.removeActiveStaffMember);
  const updateActiveStaffMemberRole = useOnboardingStore((state) => state.updateActiveStaffMemberRole);
  const players = usePlayersStore((state) => state.players);

  const location = [activeTeam.homeGround, activeTeam.district, activeTeam.region]
    .filter(Boolean)
    .join(", ");
  const activeSocialLinks = socialLinks.filter((link) => activeTeam[link.key]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Team"
        description="Manage your team profile and staff."
        action={
          <Link href="/team/edit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Pencil />
            Edit Team
          </Link>
        }
      />

      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {activeTeam.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeTeam.logo} alt="" className="size-full object-cover" />
                ) : (
                  getInitials(activeTeam.name)
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-heading text-lg font-semibold text-foreground">{activeTeam.name}</span>
                {activeTeam.nickname && (
                  <span className="text-sm text-muted-foreground">&ldquo;{activeTeam.nickname}&rdquo;</span>
                )}
              </div>
              {(activeTeam.colorPrimary || activeTeam.colorSecondary) && (
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  {activeTeam.colorPrimary && (
                    <span
                      className="size-5 rounded-full ring-1 ring-foreground/10"
                      style={{ backgroundColor: activeTeam.colorPrimary }}
                    />
                  )}
                  {activeTeam.colorSecondary && (
                    <span
                      className="size-5 rounded-full ring-1 ring-foreground/10"
                      style={{ backgroundColor: activeTeam.colorSecondary }}
                    />
                  )}
                </div>
              )}
            </div>

            {activeTeam.slogan && (
              <p className="text-sm text-muted-foreground italic">&ldquo;{activeTeam.slogan}&rdquo;</p>
            )}

            <div className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                Established {activeTeam.yearEstablished}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Social Links
              </span>
              {activeSocialLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No team social links added yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {activeSocialLinks.map((link) => (
                    <span key={link.key} className="flex items-center gap-1.5 text-sm text-foreground">
                      <link.icon className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{link.label}:</span>
                      {activeTeam[link.key]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff & Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="flex flex-col gap-3 pt-4">
          <p className="text-sm text-muted-foreground">Add coaches and managers to your team.</p>
          <StaffManager
            staff={activeTeam.staff}
            teamName={activeTeam.name}
            onAdd={addActiveStaffMember}
            onRemove={removeActiveStaffMember}
            onChangeRole={updateActiveStaffMemberRole}
          />
        </TabsContent>

        <TabsContent value="permissions" className="flex flex-col gap-3 pt-4">
          <p className="text-sm text-muted-foreground">What each role can do today.</p>
          <PermissionTable />
        </TabsContent>

        <TabsContent value="gallery" className="flex flex-col gap-3 pt-4">
          <p className="text-sm text-muted-foreground">Hover a photo to see who&apos;s who.</p>
          <TeamGallery staff={activeTeam.staff} players={players} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

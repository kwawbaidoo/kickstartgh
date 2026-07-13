"use client";

import { motion } from "framer-motion";
import { MapPin, Shield, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";
import { getInitials } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboarding-store";

function TeamProfileCard() {
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const location = [activeTeam.homeGround, activeTeam.region].filter(Boolean).join(", ");

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-semibold text-primary-foreground">
              {activeTeam.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeTeam.logo} alt="" className="size-full object-cover" />
              ) : (
                getInitials(activeTeam.name)
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-base font-semibold text-foreground">
                {activeTeam.name}
              </span>
              {location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {location}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="size-3.5" />
                Est. {activeTeam.yearEstablished}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 sm:flex-col sm:items-end sm:gap-0.5 sm:bg-transparent sm:px-0 sm:py-0">
            <Users className="size-4 text-muted-foreground sm:hidden" />
            <span className="text-sm font-medium text-foreground">
              {activeTeam.staff.length > 0
                ? `${activeTeam.staff.length} staff member${activeTeam.staff.length > 1 ? "s" : ""}`
                : "No staff added yet"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { TeamProfileCard };

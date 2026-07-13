"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, MapPin, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { fadeInUp } from "@/lib/motion";
import { getInitials } from "@/lib/utils";
import { getUpcomingMatch } from "@/mock/matches";
import { useMatchesStore } from "@/store/matches-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { currentTeam } from "@/mock/teams";

function UpcomingMatchCard() {
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const matches = useMatchesStore((state) => state.matches);
  const upcomingMatch = getUpcomingMatch(currentTeam.id, matches);

  if (!upcomingMatch) return null;

  const { opponent, date, venue, competition } = upcomingMatch;
  const opponentInitials = getInitials(opponent);

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="Upcoming Match" />
      <motion.div variants={fadeInUp} className="max-w-md">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Trophy className="size-3.5 text-accent-foreground" />
              {competition}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-1 flex-col items-center gap-2 text-center">
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {activeTeam.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeTeam.logo} alt="" className="size-full object-cover" />
                  ) : (
                    getInitials(activeTeam.name)
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{activeTeam.name}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">VS</span>
              <div className="flex flex-1 flex-col items-center gap-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                  {opponentInitials}
                </div>
                <span className="text-sm font-medium text-foreground">{opponent}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-center sm:gap-6">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {format(new Date(date), "EEE, d MMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {venue}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export { UpcomingMatchCard };

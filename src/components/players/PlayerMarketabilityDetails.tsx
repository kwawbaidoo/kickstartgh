import { format } from "date-fns";
import { Briefcase, Cake, Dumbbell, GraduationCap, Link2, MapPin, Shirt, Trophy } from "lucide-react";

import type { Player } from "@/mock/players";
import { getAge } from "@/lib/players";

const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  facebook: "Facebook",
  tiktok: "TikTok",
};

type PlayerMarketabilityDetailsProps = {
  player: Player;
};

/**
 * The "make a player marketable" facts — quick stats grid, education, work
 * experience, achievements, other sports, and social links. Deliberately
 * excludes contact/emergency info, so it's safe to reuse on both the
 * coach-facing player page and the public shareable profile.
 */
function PlayerMarketabilityDetails({ player }: PlayerMarketabilityDetailsProps) {
  const profile = player.profile;

  const quickFacts = [
    { label: "Age", value: `${getAge(player.dateOfBirth)} years old` },
    { label: "Nationality", value: profile?.nationality || "Not provided" },
    {
      label: "Position",
      value: player.secondaryPosition ? `${player.position} / ${player.secondaryPosition}` : player.position,
    },
    { label: "Preferred foot", value: player.preferredFoot },
    ...(profile?.height ? [{ label: "Height", value: profile.height }] : []),
  ];

  const education = profile?.education ?? [];
  const workExperience = profile?.workExperience ?? [];
  const achievements = profile?.achievements ?? [];
  const otherSports = profile?.otherSports ?? [];
  const socialLinks = Object.entries(profile?.socialLinks ?? {}).filter(
    (entry): entry is [string, string] => !!entry[1]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 sm:grid-cols-3">
        {quickFacts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{fact.label}</span>
            <span className="text-sm font-medium text-foreground">{fact.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm">
          <Cake className="size-4 shrink-0 text-muted-foreground" />
          <span className="w-32 shrink-0 text-muted-foreground">Date of birth</span>
          <span className="font-medium text-foreground">
            {format(new Date(player.dateOfBirth), "d MMM yyyy")}
          </span>
        </div>
        {player.village && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-muted-foreground">Location</span>
            <span className="font-medium text-foreground">{player.village}</span>
          </div>
        )}
        {player.previousClub && (
          <div className="flex items-center gap-3 text-sm">
            <Shirt className="size-4 shrink-0 text-muted-foreground" />
            <span className="w-32 shrink-0 text-muted-foreground">Previous club</span>
            <span className="font-medium text-foreground">{player.previousClub}</span>
          </div>
        )}
      </div>

      {education.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <GraduationCap className="size-3.5" /> Education
          </span>
          <ul className="flex flex-col gap-1.5">
            {education.map((entry, index) => (
              <li key={index} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-foreground">{entry.institution}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{entry.period}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {workExperience.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Briefcase className="size-3.5" /> Work Experience
          </span>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {workExperience.map((item, index) => (
              <li key={index} className="ml-4 list-disc marker:text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Trophy className="size-3.5" /> Achievements
          </span>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {achievements.map((item, index) => (
              <li key={index} className="ml-4 list-disc marker:text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {otherSports.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Dumbbell className="size-3.5" /> Other Sports
          </span>
          <div className="flex flex-wrap gap-2">
            {otherSports.map((sport) => (
              <span key={sport} className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                {sport}
              </span>
            ))}
          </div>
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Social Links
          </span>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
              >
                <Link2 className="size-3.5" />
                {socialLabels[platform] ?? platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { PlayerMarketabilityDetails };

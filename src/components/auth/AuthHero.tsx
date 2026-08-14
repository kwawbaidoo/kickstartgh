import { CalendarDays, ClipboardCheck, Trophy, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { PitchBackground } from "@/components/matches/PitchBackground";

const highlights = [
  { icon: Users, text: "Manage your squad, staff, and every player profile." },
  { icon: CalendarDays, text: "Schedule matches, build lineups, and log every goal." },
  { icon: ClipboardCheck, text: "Track attendance and share reports in one tap." },
];

function GhanaFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#006B3F" />
      <rect width="24" height="10.67" fill="#FCD116" />
      <rect width="24" height="5.33" fill="#CE1126" />
      <path
        fill="#000000"
        d="M12 5.6l.55 1.7h1.79l-1.45 1.05.55 1.7-1.44-1.05-1.45 1.05.55-1.7-1.44-1.05h1.78z"
      />
    </svg>
  );
}

type AuthHeroProps = {
  className?: string;
};

function AuthHero({ className }: AuthHeroProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-b-3xl bg-primary text-primary-foreground lg:rounded-none",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-accent/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-10 right-0 size-80 rounded-full bg-sky-300/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-[-45%] h-[90%] opacity-[0.12] mask-[linear-gradient(to_top,black,transparent)]"
        aria-hidden="true"
      >
        <PitchBackground />
      </div>

      <div className="relative flex h-full flex-col justify-between gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-14">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold backdrop-blur">
            K
          </div>
          <span className="font-heading text-sm font-semibold tracking-wide">KickStartGH</span>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <GhanaFlagIcon className="h-2.5 w-auto rounded-[2px]" />
            Built for grassroots football
          </span>

          <h1 className="font-heading text-2xl leading-tight font-semibold text-balance sm:text-3xl lg:text-[2.75rem]">
            Every cup final starts on a local pitch.
          </h1>

          <p className="hidden max-w-md text-sm leading-relaxed text-primary-foreground/80 sm:text-base lg:block">
            KickStartGH gives Ghanaian coaches and team managers the tools big clubs use — squads,
            matches, attendance and reports — simple enough to run from your phone.
          </p>

          <ul className="hidden flex-col gap-3 lg:flex">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-primary-foreground/90">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-2 text-xs text-primary-foreground/60 lg:flex">
          <Trophy className="size-4" />
          Built for coaches. Loved on WhatsApp.
        </div>
      </div>
    </div>
  );
}

export { AuthHero };

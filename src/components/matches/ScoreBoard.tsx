import type { MatchStatus } from "@/mock/matches";
import { getInitials } from "@/lib/utils";

type ScoreBoardProps = {
  teamName: string;
  teamLogo?: string;
  opponent: string;
  teamScore?: number;
  opponentScore?: number;
  status: MatchStatus;
};

function ScoreBoard({ teamName, teamLogo, opponent, teamScore, opponentScore, status }: ScoreBoardProps) {
  const hasScore = status === "completed" && teamScore !== undefined && opponentScore !== undefined;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-semibold text-primary-foreground">
          {teamLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teamLogo} alt="" className="size-full object-cover" />
          ) : (
            getInitials(teamName)
          )}
        </div>
        <span className="text-sm font-medium text-foreground">{teamName}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        {hasScore ? (
          <span className="font-heading text-3xl font-bold text-foreground">
            {teamScore}–{opponentScore}
          </span>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">
            {status === "cancelled" ? "Cancelled" : "VS"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-base font-semibold text-secondary-foreground">
          {getInitials(opponent)}
        </div>
        <span className="text-sm font-medium text-foreground">{opponent}</span>
      </div>
    </div>
  );
}

export { ScoreBoard };

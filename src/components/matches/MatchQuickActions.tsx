import Link from "next/link";
import { Pencil } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { MatchTimelineModal } from "@/components/matches/MatchTimelineModal";
import { MatchActionsMenu } from "@/components/matches/MatchActionsMenu";
import type { Match } from "@/mock/matches";

function MatchQuickActions({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-1">
      <MatchTimelineModal match={match} />
      <Link
        href={`/matches/${match.id}/edit`}
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        aria-label="Edit match"
      >
        <Pencil className="size-4" />
      </Link>
      <MatchActionsMenu match={match} />
    </div>
  );
}

export { MatchQuickActions };

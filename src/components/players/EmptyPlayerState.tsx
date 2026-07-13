import { SearchX, UserPlus } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";

type EmptyPlayerStateProps = {
  variant: "no-players" | "no-results";
  onClearFilters?: () => void;
};

function EmptyPlayerState({ variant, onClearFilters }: EmptyPlayerStateProps) {
  if (variant === "no-results") {
    return (
      <EmptyState
        icon={SearchX}
        title="No players found."
        description="Try searching another name, or clear your filters."
        actionLabel={onClearFilters ? "Clear filters" : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <EmptyState
      icon={UserPlus}
      title="No players added yet."
      description="Build your squad digitally."
      actionLabel="Add your first player"
      actionHref="/players/new"
    />
  );
}

export { EmptyPlayerState };

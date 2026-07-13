import * as React from "react";

import { cn } from "@/lib/utils";

function LoadingSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="loading-skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="size-8 rounded-lg" />
      </div>
      <LoadingSkeleton className="h-7 w-16" />
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      <LoadingSkeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <LoadingSkeleton className="h-3 w-2/3" />
        <LoadingSkeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export { LoadingSkeleton, StatCardSkeleton, ListRowSkeleton };

import type { ReactNode } from "react";

type FilterPanelProps = {
  title?: string;
  children: ReactNode;
};

function FilterPanel({ title = "Filters", children }: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
    </div>
  );
}

export { FilterPanel };

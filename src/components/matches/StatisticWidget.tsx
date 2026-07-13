import type { ReactNode } from "react";

type StatisticWidgetProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
};

function StatisticWidget({ icon, label, value }: StatisticWidgetProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground [&>svg]:size-4">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export { StatisticWidget };

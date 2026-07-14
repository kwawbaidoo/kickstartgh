import type { MonthlyAttendance } from "@/lib/training";

const CHART_HEIGHT = 120;

type AttendanceChartProps = {
  data: MonthlyAttendance[];
};

function AttendanceChart({ data }: AttendanceChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Not enough completed sessions yet to show a trend.
      </p>
    );
  }

  return (
    <div className="flex items-end gap-3" style={{ height: CHART_HEIGHT + 40 }}>
      {data.map((entry) => (
        <div
          key={entry.month}
          className="flex flex-1 flex-col items-center justify-end gap-1.5"
          style={{ height: CHART_HEIGHT + 40 }}
          title={`${entry.month}: ${entry.percentage}% average attendance`}
        >
          <span className="text-xs font-medium text-foreground">{entry.percentage}%</span>
          <div
            className="w-full max-w-8 rounded-t-sm bg-chart-1"
            style={{ height: Math.max((entry.percentage / 100) * CHART_HEIGHT, 4) }}
          />
          <span className="text-[10px] whitespace-nowrap text-muted-foreground">
            {entry.month.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

export { AttendanceChart };

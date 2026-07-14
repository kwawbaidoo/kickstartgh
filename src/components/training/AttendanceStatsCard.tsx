import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AttendanceStatsCardProps = {
  attendancePercentage: number;
  sessionsAttended: number;
  sessionsMissed: number;
  consecutivePresent: number;
  consecutiveAbsent: number;
};

function AttendanceStatsCard({
  attendancePercentage,
  sessionsAttended,
  sessionsMissed,
  consecutivePresent,
  consecutiveAbsent,
}: AttendanceStatsCardProps) {
  const streakLabel =
    consecutiveAbsent > 0 ? `${consecutiveAbsent} missed in a row` : `${consecutivePresent} attended in a row`;

  const items = [
    { label: "Attendance", value: `${attendancePercentage}%` },
    { label: "Attended", value: sessionsAttended },
    { label: "Missed", value: sessionsMissed },
    { label: "Current Streak", value: streakLabel },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 text-center">
              <span className="font-heading text-lg font-semibold text-foreground">{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { AttendanceStatsCard };

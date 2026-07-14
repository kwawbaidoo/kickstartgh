"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FilterPanel } from "@/components/reports/FilterPanel";
import { AttendanceChart } from "@/components/training/AttendanceChart";
import { TrainingTimeline } from "@/components/training/TrainingTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attendanceStatusConfig, attendanceStatusOptions } from "@/config/training";
import { usePlayersStore } from "@/store/players-store";
import { useAttendanceStore } from "@/store/attendance-store";
import {
  defaultTrainingHistoryFilters,
  filterTrainingHistory,
  getMonthlyAverages,
  type TrainingHistoryFilters,
} from "@/lib/training";
import type { AttendanceStatus } from "@/mock/attendance";

export default function TrainingHistoryPage() {
  const sessions = useAttendanceStore((state) => state.sessions);
  const players = usePlayersStore((state) => state.players);
  const [filters, setFilters] = useState<TrainingHistoryFilters>(defaultTrainingHistoryFilters);

  const filteredSessions = filterTrainingHistory(sessions, filters);
  const trend = getMonthlyAverages(filteredSessions);

  const playerItems = {
    All: "All players",
    ...Object.fromEntries(players.map((player) => [player.id, player.fullName])),
  };
  const statusItems = {
    All: "All statuses",
    ...Object.fromEntries(attendanceStatusOptions.map((option) => [option, attendanceStatusConfig[option].label])),
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <SectionHeader title="Attendance History" description="Past sessions, records, and trends." />

      <FilterPanel>
        <Select
          items={playerItems}
          value={filters.playerId}
          onValueChange={(value) => setFilters({ ...filters, playerId: value ?? "All" })}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All players</SelectItem>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={statusItems}
          value={filters.status}
          onValueChange={(value) =>
            setFilters({ ...filters, status: (value ?? "All") as AttendanceStatus | "All" })
          }
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {attendanceStatusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {attendanceStatusConfig[option].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })}
          className="w-full sm:w-auto"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })}
          className="w-full sm:w-auto"
        />
      </FilterPanel>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceChart data={trend} />
        </CardContent>
      </Card>

      {filteredSessions.length === 0 ? (
        <EmptyState
          title="No sessions match these filters."
          description="Try widening your date range or clearing a filter."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <TrainingTimeline sessions={filteredSessions} players={players} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

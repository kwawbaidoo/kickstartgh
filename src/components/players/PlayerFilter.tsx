"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ageGroupOptions, positionOptions, statusOptions } from "@/config/players";
import type { PlayerFilters } from "@/lib/players";
import { toSelectItems } from "@/lib/utils";

const positionItems = { All: "All positions", ...toSelectItems(positionOptions) };
const ageGroupItems = { All: "All ages", ...toSelectItems(ageGroupOptions) };
const statusItems = { All: "All availability", ...toSelectItems(statusOptions) };

type PlayerFilterProps = {
  filters: PlayerFilters;
  onChange: (filters: PlayerFilters) => void;
};

function PlayerFilter({ filters, onChange }: PlayerFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        items={positionItems}
        value={filters.position}
        onValueChange={(value) => onChange({ ...filters, position: value as PlayerFilters["position"] })}
      >
        <SelectTrigger className="w-full sm:w-auto">
          <SelectValue placeholder="Position" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All positions</SelectItem>
          {positionOptions.map((position) => (
            <SelectItem key={position} value={position}>
              {position}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={ageGroupItems}
        value={filters.ageGroup}
        onValueChange={(value) => onChange({ ...filters, ageGroup: value as PlayerFilters["ageGroup"] })}
      >
        <SelectTrigger className="w-full sm:w-auto">
          <SelectValue placeholder="Age group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All ages</SelectItem>
          {ageGroupOptions.map((group) => (
            <SelectItem key={group} value={group}>
              {group}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={statusItems}
        value={filters.status}
        onValueChange={(value) => onChange({ ...filters, status: value as PlayerFilters["status"] })}
      >
        <SelectTrigger className="w-full sm:w-auto">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All availability</SelectItem>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { PlayerFilter };

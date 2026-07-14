"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ReportColumn } from "@/config/reports";

type ColumnSelectorProps = {
  allColumns: ReportColumn[];
  selected: string[];
  onChange: (keys: string[]) => void;
  presets?: { name: string; columns: string[] }[];
};

function ColumnSelector({ allColumns, selected, onChange, presets }: ColumnSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredColumns = allColumns.filter((column) =>
    column.label.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(key: string) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  function move(key: string, direction: -1 | 1) {
    const index = selected.indexOf(key);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selected.length) return;
    const next = [...selected];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(preset.columns)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search columns..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(allColumns.map((c) => c.key))}>
          Select all
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
          Clear
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        {filteredColumns.map((column) => (
          <label
            key={column.key}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
          >
            <Checkbox
              checked={selected.includes(column.key)}
              onCheckedChange={() => toggle(column.key)}
            />
            <span className="text-sm text-foreground">{column.label}</span>
          </label>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Column order ({selected.length} selected)
          </span>
          <div className="flex flex-col gap-1">
            {selected.map((key, index) => {
              const column = allColumns.find((c) => c.key === key);
              if (!column) return null;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-2 py-1.5"
                >
                  <span className="text-sm text-foreground">{column.label}</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(key, -1)}
                      disabled={index === 0}
                      className="rounded p-1 text-muted-foreground hover:bg-background disabled:opacity-30"
                      aria-label={`Move ${column.label} up`}
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(key, 1)}
                      disabled={index === selected.length - 1}
                      className="rounded p-1 text-muted-foreground hover:bg-background disabled:opacity-30"
                      aria-label={`Move ${column.label} down`}
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${column.label}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { ColumnSelector };

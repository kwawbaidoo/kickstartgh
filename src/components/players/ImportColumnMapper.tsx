"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { importFields, type ImportFieldKey } from "@/config/player-import";
import type { ColumnMapping, SheetColumn } from "@/lib/player-import";

/** Base UI's Select needs a real value per item, so "not imported" gets a sentinel. */
const NONE = "__none__";

type ImportColumnMapperProps = {
  columns: SheetColumn[];
  mapping: ColumnMapping;
  onChange: (field: ImportFieldKey, column: string | undefined) => void;
};

function ImportColumnMapper({ columns, mapping, onChange }: ImportColumnMapperProps) {
  const items: Record<string, string> = {
    [NONE]: "Not imported",
    ...Object.fromEntries(columns.map((column) => [column.name, column.name])),
  };

  // A heading already used by another field is still selectable — picking it just moves it,
  // which is friendlier than disabling options the user is trying to correct.
  const usedBy = new Map<string, ImportFieldKey>();
  for (const [key, column] of Object.entries(mapping)) {
    if (column) usedBy.set(column, key as ImportFieldKey);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {importFields.map((field) => {
        const value = mapping[field.key];
        const isMapped = !!value;

        return (
          <div
            key={field.key}
            className="flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/5 dark:ring-foreground/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  )}
                </span>
                {field.hint && (
                  <span className="text-xs leading-snug text-muted-foreground">{field.hint}</span>
                )}
              </div>

              {isMapped ? (
                <Badge tone="success" className="shrink-0">
                  <Check aria-hidden="true" />
                  Matched
                </Badge>
              ) : field.required ? (
                <Badge tone="destructive" className="shrink-0">
                  Required
                </Badge>
              ) : null}
            </div>

            <Select
              items={items}
              value={value ?? NONE}
              onValueChange={(next) => onChange(field.key, next === NONE ? undefined : String(next))}
            >
              <SelectTrigger
                size="sm"
                aria-label={`Spreadsheet column for ${field.label}`}
                className="mt-auto w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not imported</SelectItem>
                {columns.map((column) => {
                  const owner = usedBy.get(column.name);
                  const takenElsewhere = owner && owner !== field.key;
                  return (
                    <SelectItem key={column.name} value={column.name}>
                      {column.name}
                      {takenElsewhere ? " — already used" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}

export { ImportColumnMapper };

"use client";

import { Check, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { isBuiltInStaffRole, staffRoleIcon, staffRoleOptions, staffRoleDescription } from "@/config/roles";
import { cn } from "@/lib/utils";

type RolePickerProps = {
  value: string;
  onChange: (role: string) => void;
  /** Custom roles this team already uses, offered as extra cards so they aren't retyped. */
  suggestions?: string[];
  invalid?: boolean;
  inputId?: string;
};

/**
 * Suggested roles as tappable cards, plus a free-text field for anything else — teams need
 * roles the four built-ins don't cover (physio, kit manager, welfare officer).
 *
 * `value` is the only state: a card is selected when it equals `value`, and the text field
 * holds `value` whenever it isn't a built-in id. So typing deselects the cards and picking
 * a card empties the field, with nothing to keep in sync.
 */
function RolePicker({ value, onChange, suggestions = [], invalid, inputId = "custom-role" }: RolePickerProps) {
  const cards = [
    ...staffRoleOptions.map((option) => ({ value: option.value, label: option.label })),
    ...suggestions.map((role) => ({ value: role, label: role })),
  ];

  // A built-in is stored as a camelCase id, which would read as gibberish in the field.
  const customValue = isBuiltInStaffRole(value) ? "" : value;

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-invalid={invalid || undefined} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = staffRoleIcon(card.value);
          const selected = value === card.value;
          const description = staffRoleDescription(card.value);

          return (
            <button
              key={card.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(card.value)}
              className={cn(
                "group relative flex items-start gap-3 rounded-xl border p-3 text-left transition-colors outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-transparent hover:bg-muted/60 dark:bg-input/20 dark:hover:bg-input/40"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{card.label}</span>
                {description ? (
                  <span className="text-xs leading-snug text-muted-foreground">{description}</span>
                ) : (
                  <span className="text-xs leading-snug text-muted-foreground">
                    Custom role on your team
                  </span>
                )}
              </span>

              {selected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Or enter a different role
        </label>
        <Input
          id={inputId}
          value={customValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. Physio, Kit Manager, Welfare Officer"
          aria-invalid={invalid || undefined}
        />
      </div>
    </div>
  );
}

export { RolePicker };

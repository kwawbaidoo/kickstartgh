"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formationOptions } from "@/config/matches";
import type { Formation } from "@/mock/matches";
import { toSelectItems } from "@/lib/utils";

const formationItems = toSelectItems(formationOptions);

type FormationSelectorProps = {
  value: Formation;
  onChange: (formation: Formation) => void;
};

function FormationSelector({ value, onChange }: FormationSelectorProps) {
  return (
    <Select items={formationItems} value={value} onValueChange={(next) => onChange(next as Formation)}>
      <SelectTrigger className="w-full sm:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {formationOptions.map((formation) => (
          <SelectItem key={formation} value={formation}>
            {formation}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { FormationSelector };

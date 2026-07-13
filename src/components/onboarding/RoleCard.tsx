"use client";

import { motion } from "framer-motion";

import type { RoleOption } from "@/config/roles";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RoleCardProps = {
  role: RoleOption;
  selected: boolean;
  onSelect: () => void;
};

function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const Icon = role.icon;

  return (
    <motion.div variants={fadeInUp}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left ring-1 transition-colors",
          selected
            ? "border-primary ring-2 ring-primary"
            : "border-transparent ring-foreground/10 hover:ring-foreground/20"
        )}
      >
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            selected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{role.label}</span>
            {role.recommended && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                Recommended
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{role.description}</span>
        </div>
        <div
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-primary bg-primary" : "border-border"
          )}
        >
          {selected && <div className="size-2 rounded-full bg-primary-foreground" />}
        </div>
      </button>
    </motion.div>
  );
}

export { RoleCard };

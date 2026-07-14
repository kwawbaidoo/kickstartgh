"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { fadeInUp } from "@/lib/motion";

type SettingsCardProps = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

function SettingsCard({ label, description, href, icon: Icon }: SettingsCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted/60 active:bg-muted"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="truncate text-xs text-muted-foreground">{description}</span>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </motion.div>
  );
}

export { SettingsCard };

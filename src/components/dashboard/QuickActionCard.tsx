"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { fadeInUp } from "@/lib/motion";

type QuickActionCardProps = {
  label: string;
  icon: ReactNode;
  href: string;
};

function QuickActionCard({ label, icon, href }: QuickActionCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Link
        href={href}
        className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl bg-card p-4 text-center ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-all hover:bg-accent hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] dark:shadow-none dark:ring-foreground/10"
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors [&>svg]:size-5 group-hover:bg-accent-foreground group-hover:text-accent">
          {icon}
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </Link>
    </motion.div>
  );
}

export { QuickActionCard };

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
        className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl bg-card p-4 text-center ring-1 ring-foreground/10 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
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

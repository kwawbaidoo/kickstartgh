"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { staggerContainer } from "@/lib/motion";

function Stagger({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { Stagger };

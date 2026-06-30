"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

interface MotionPageProps {
  children: React.ReactNode;
  className?: string;
}

export default function MotionPage({ children, className }: MotionPageProps) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

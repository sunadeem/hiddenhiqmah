"use client";

import { motion } from "framer-motion";

interface ContentCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function ContentCard({ children, delay = 0, className = "" }: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`card-bg rounded-xl border sidebar-border p-5 md:p-6 card-hover ${className}`}
    >
      {children}
    </motion.div>
  );
}

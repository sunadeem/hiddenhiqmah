"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  titleAr: string;
  subtitle: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, titleAr, subtitle, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-themed">{title}</h1>
            <span className="text-2xl md:text-3xl font-arabic text-gold">{titleAr}</span>
          </div>
          <p className="text-themed-muted text-lg">{subtitle}</p>
          <div className="mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-transparent" />
        </div>
        {action && <div className="shrink-0 mt-1">{action}</div>}
      </div>
    </motion.div>
  );
}

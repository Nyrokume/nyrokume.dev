"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroStat } from "@/lib/types";

type StatCardProps = {
  stat: HeroStat;
  index: number;
};

function parseNumeric(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && String(n) === value ? n : null;
}

function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

export function StatCard({ stat, index }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const numericTarget = parseNumeric(stat.value);
  const count = useCountUp(numericTarget ?? 0, inView && numericTarget !== null);
  const displayValue = numericTarget !== null ? String(count) : stat.value;

  const body = (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{ duration: 0.25 }}
      />
      <p className="text-xs text-muted">{stat.label}</p>
      <motion.p
        className={`mt-1 text-lg font-semibold transition-colors duration-200 ${
          stat.highlight
            ? "text-accent-bright group-hover:text-terminal-success"
            : "text-foreground"
        }`}
        initial={false}
        animate={
          stat.highlight && inView
            ? { opacity: [0.7, 1, 0.85, 1] }
            : { opacity: 1 }
        }
        transition={
          stat.highlight
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        {displayValue}
      </motion.p>
    </>
  );

  const motionProps = {
    ref,
    initial: { opacity: 0, y: 16, scale: 0.96 },
    animate: inView ? { opacity: 1, y: 0, scale: 1 } : {},
    transition: {
      duration: 0.45,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
    whileHover: {
      y: -3,
      borderColor: "var(--border-accent)",
      boxShadow: "0 0 24px var(--accent-muted)",
    },
    className: `group relative overflow-hidden rounded-lg border border-border bg-surface-elevated px-4 py-3 transition-colors${
      stat.href ? " cursor-pointer" : ""
    }`,
  };

  if (stat.href) {
    return (
      <motion.div {...motionProps}>
        <Link
          href={stat.href}
          className="focus-ring absolute inset-0 rounded-lg"
          aria-label={`${stat.label}: ${stat.value}`}
        />
        {body}
      </motion.div>
    );
  }

  return <motion.div {...motionProps}>{body}</motion.div>;
}

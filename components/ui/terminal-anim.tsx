"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

type TypewriterPromptProps = {
  command: string;
  cwd?: string;
  delay?: number;
  onComplete?: () => void;
};

export function TypewriterPrompt({
  command,
  cwd = "~",
  delay = 0,
  onComplete,
}: TypewriterPromptProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!inView) return;
    const timer = window.setTimeout(() => setStarted(true), delay);
    return () => window.clearTimeout(timer);
  }, [inView, delay]);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setText(command.slice(0, index));
      if (index >= command.length) {
        window.clearInterval(interval);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, 32);

    return () => window.clearInterval(interval);
  }, [started, command]);

  return (
    <p ref={ref} className="terminal-log text-sm">
      <span className="text-prompt-user">nyrokume</span>
      <span className="text-prompt-host">@arch</span>
      <span className="text-foreground">:</span>
      <span className="text-prompt-path">{cwd}</span>
      <span className="text-foreground">$ </span>
      <span className="text-foreground">{text}</span>
      {started && !done ? (
        <span className="ml-0.5 inline-block h-4 w-1.5 cursor-blink align-middle" aria-hidden />
      ) : null}
    </p>
  );
}

type TerminalRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function TerminalReveal({
  children,
  delay = 0,
  className = "",
}: TerminalRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [inView, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -6 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type TerminalLogLineProps = {
  prefix?: string;
  label: string;
  value: string;
  delay?: number;
  prefixClassName?: string;
};

export function TerminalLogLine({
  prefix = "[ok]",
  label,
  value,
  delay = 0,
  prefixClassName = "text-terminal-success",
}: TerminalLogLineProps) {
  return (
    <TerminalReveal delay={delay} className="terminal-log text-sm">
      <span className={prefixClassName}>{prefix}</span>{" "}
      <span className="text-muted">{label.padEnd(10, " ")}</span>
      <span className="text-muted">→ </span>
      <span className="text-foreground">{value}</span>
    </TerminalReveal>
  );
}

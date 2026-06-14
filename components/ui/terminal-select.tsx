"use client";

import { useEffect, useRef, useState } from "react";

export type TerminalSelectOption = {
  value: string;
  label: string;
};

type TerminalSelectProps = {
  value: string;
  options: TerminalSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  "aria-label": string;
  align?: "left" | "right";
};

export function TerminalSelect({
  value,
  options,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
  align = "right",
}: TerminalSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("click", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) setOpen((current) => !current);
        }}
        className="focus-ring flex h-7 max-w-[10rem] cursor-pointer items-center gap-1 rounded border border-border bg-background px-2 text-xs text-foreground transition-colors hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[12rem]"
      >
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label ?? value}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-2.5 w-2.5 shrink-0 fill-none stroke-current text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <path strokeWidth="2.5" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`absolute top-full z-[60] pt-1 transition-opacity duration-150 ${
          align === "right" ? "right-0" : "left-0"
        } ${
          open
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
      >
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="max-h-56 min-w-full overflow-y-auto rounded border border-border bg-surface-elevated py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`focus-ring w-full cursor-pointer px-3 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-accent-muted text-accent-bright"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

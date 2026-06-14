type SkillCategoryIconProps = {
  id: string;
  className?: string;
};

const iconClass = "h-3.5 w-3.5 shrink-0 stroke-current";

export function SkillCategoryIcon({ id, className }: SkillCategoryIconProps) {
  const cn = className ? `${iconClass} ${className}` : iconClass;

  switch (id) {
    case "frontend":
      return (
        <svg viewBox="0 0 16 16" className={cn} fill="none" aria-hidden>
          <rect x="1.5" y="2.5" width="13" height="11" rx="1" strokeWidth="1.25" />
          <path d="M1.5 5h13" strokeWidth="1.25" />
          <rect x="3.5" y="7" width="5" height="4.5" rx="0.5" strokeWidth="1.1" />
          <path d="M10 7.5h2.5M10 10h3M10 12.5h2" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );

    case "backend":
      return (
        <svg viewBox="0 0 16 16" className={cn} fill="none" aria-hidden>
          <rect x="3" y="2" width="10" height="3" rx="0.75" strokeWidth="1.25" />
          <rect x="3" y="6.5" width="10" height="3" rx="0.75" strokeWidth="1.25" />
          <rect x="3" y="11" width="10" height="3" rx="0.75" strokeWidth="1.25" />
          <circle cx="5" cy="3.5" r="0.55" fill="currentColor" stroke="none" />
          <circle cx="5" cy="8" r="0.55" fill="currentColor" stroke="none" />
          <circle cx="5" cy="12.5" r="0.55" fill="currentColor" stroke="none" />
        </svg>
      );

    case "api":
      return (
        <svg viewBox="0 0 16 16" className={cn} fill="none" aria-hidden>
          <rect x="1.5" y="5" width="4" height="6" rx="0.75" strokeWidth="1.25" />
          <rect x="10.5" y="5" width="4" height="6" rx="0.75" strokeWidth="1.25" />
          <path d="M6 8h4" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M8.2 6.8 9.8 8 8.2 9.2" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.8 6.8 6.2 8l1.6 1.2" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "frameworks":
      return (
        <svg viewBox="0 0 16 16" className={cn} fill="none" aria-hidden>
          <path d="M2 10.5 8 13.5 14 10.5" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M2 8 8 11 14 8" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M2 5.5 8 8.5 14 5.5" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M8 2.5v11" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
        </svg>
      );

    case "tools":
      return (
        <svg viewBox="0 0 16 16" className={cn} fill="none" aria-hidden>
          <path
            d="M10.2 2.8a2.6 2.6 0 0 0-3.4 3.9L3.5 10l2 2 3.3-3.3a2.6 2.6 0 0 0 3.9-3.4L9.8 8.2"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3.5 10 2 11.5" strokeWidth="1.25" strokeLinecap="round" />
          <circle cx="11.5" cy="4.5" r="0.75" strokeWidth="1.1" />
        </svg>
      );

    case "enterprise":
      return (
        <svg viewBox="0 0 16 16" className={cn} fill="none" aria-hidden>
          <path d="M3 13.5V6.5l5-3 5 3v7" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M6.5 13.5V9.5h3v4" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M1.5 13.5h13" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M5.5 7h1M9.5 7h1M5.5 9.5h1M9.5 9.5h1" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 16 16" className={cn} fill="none" aria-hidden>
          <path
            d="M2.5 4.5A1.5 1.5 0 0 1 4 3h8a1.5 1.5 0 0 1 1.5 1.5V12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 12V4.5Z"
            strokeWidth="1.25"
          />
          <path d="M2.5 6.5h11" strokeWidth="1.25" />
        </svg>
      );
  }
}

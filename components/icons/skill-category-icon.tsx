type SkillCategoryIconProps = {
  id: string;
  className?: string;
};

const iconClass = "h-4 w-4 shrink-0 stroke-current";

const stroke = {
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SkillCategoryIcon({ id, className }: SkillCategoryIconProps) {
  const cn = className ? `${iconClass} ${className}` : iconClass;

  switch (id) {
    case "frontend":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" aria-hidden>
          <rect x="2.5" y="4" width="19" height="15" rx="2" {...stroke} />
          <path d="M2.5 8.5h19" {...stroke} />
          <circle cx="5.5" cy="6.25" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="8.25" cy="6.25" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="11" cy="6.25" r="0.85" fill="currentColor" stroke="none" />
          <rect x="5" y="11" width="6.5" height="5" rx="1" {...stroke} />
          <path d="M14 11.5h5M14 14h4M14 16.5h5.5" {...stroke} />
        </svg>
      );

    case "backend":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" aria-hidden>
          <rect x="3" y="4" width="18" height="5.5" rx="1.5" {...stroke} />
          <rect x="3" y="11" width="18" height="5.5" rx="1.5" {...stroke} />
          <rect x="3" y="18" width="18" height="2.5" rx="1" {...stroke} />
          <circle cx="6.25" cy="6.75" r="1" fill="currentColor" stroke="none" />
          <circle cx="6.25" cy="13.75" r="1" fill="currentColor" stroke="none" />
          <path d="M9.5 6.75h8.5M9.5 13.75h6.5" {...stroke} opacity="0.45" />
          <ellipse cx="12" cy="19.25" rx="4.5" ry="1.1" {...stroke} opacity="0.35" />
        </svg>
      );

    case "api":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" aria-hidden>
          <path d="M8 7C5.5 9 5.5 15 8 17" {...stroke} />
          <path d="M16 7c2.5 2 2.5 8 0 10" {...stroke} />
          <path d="M13.5 9 10.5 15" {...stroke} />
        </svg>
      );

    case "frameworks":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" aria-hidden>
          <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" {...stroke} />
          <path d="M4 7.5 12 12l8-4.5M12 12v9" {...stroke} />
          <path d="M8.5 9.75 12 12l3.5-2.25" {...stroke} opacity="0.55" />
        </svg>
      );

    case "tools":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" aria-hidden>
          <path
            d="M14.7 6.3a4.5 4.5 0 0 0-6.1 6.1L3 18l3 3 5.6-5.6a4.5 4.5 0 0 0 6.1-6.1l-1.9 1.9-2.2-2.2 1.9-1.9Z"
            {...stroke}
          />
          <path d="M13.5 4.5 19.5 10.5" {...stroke} />
          <circle cx="16.75" cy="7.25" r="1.35" {...stroke} />
        </svg>
      );

    case "enterprise":
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" aria-hidden>
          <path d="M4 20V9.5l8-4.5 8 4.5V20" {...stroke} />
          <path d="M2.5 20h19" {...stroke} />
          <path d="M9.5 20v-5.5h5V20" {...stroke} />
          <path d="M8 12.5h2M14 12.5h2M8 15.5h2M14 15.5h2" {...stroke} />
          <path d="M12 5v2.5" {...stroke} opacity="0.55" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" className={cn} fill="none" aria-hidden>
          <path
            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
            {...stroke}
          />
          <path d="M4 9h16" {...stroke} />
          <path d="M8 13h8M8 16h5" {...stroke} />
        </svg>
      );
  }
}

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className = "" }: LogoProps) {
  return (
    <span className={`logo ${className}`} aria-label="liftie">
      <svg
        className="logo-mark"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M8 5v12c0 5 3 8 8 8h9" />
        <circle cx="8" cy="5" r="2.5" />
        <circle cx="25" cy="25" r="2.5" />
      </svg>
      {!compact && <span>liftie</span>}
    </span>
  );
}

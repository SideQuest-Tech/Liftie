type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className = "" }: LogoProps) {
  return (
    <span className={`logo ${className}`} aria-label="liftie">
      <svg
        className="logo-mark"
        viewBox="0 0 40 40"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M7 7v17c0 7 3 9 10 9h7" />
        <circle cx="35" cy="33" r="4.5" />
      </svg>
      {!compact && <span>liftie</span>}
    </span>
  );
}

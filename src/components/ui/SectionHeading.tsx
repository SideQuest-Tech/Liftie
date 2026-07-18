import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className = "",
  id,
}: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading-${align} ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id}>{title}</h2>
      {body && <div className="section-heading-copy">{body}</div>}
    </div>
  );
}

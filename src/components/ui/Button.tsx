import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  children: ReactNode;
  arrow?: boolean;
};

export function Button({
  variant = "primary",
  children,
  arrow = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {arrow && <ArrowRight size={17} aria-hidden="true" />}
    </button>
  );
}

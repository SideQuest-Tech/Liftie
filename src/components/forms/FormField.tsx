import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
};

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type SelectProps = BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    children: ReactNode;
  };

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

export function FormField(props: InputProps | SelectProps | TextareaProps) {
  const {
    label,
    name,
    error,
    hint,
    required,
    className = "",
    as = "input",
    ...fieldProps
  } = props;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={`form-field ${className}`}>
      <span className="field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {as === "select" ? (
        <select
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          {...(fieldProps as SelectHTMLAttributes<HTMLSelectElement>)}
        />
      ) : as === "textarea" ? (
        <textarea
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && <small id={hintId} className="field-hint">{hint}</small>}
      {error && <small id={errorId} className="field-error">{error}</small>}
    </label>
  );
}

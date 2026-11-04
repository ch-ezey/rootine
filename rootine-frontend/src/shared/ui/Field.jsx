import { useId } from "react";
import { cn } from "../lib/cn.js";

const control =
  "w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text placeholder:text-subtle " +
  "transition-colors hover:border-subtle focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 " +
  "disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus:ring-danger/15";

/** Label + control + hint/error, with ids wired for accessibility. */
export function Field({ label, hint, error, children, className }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, rows = 3, ...props }) {
  return <textarea rows={rows} className={cn(control, "py-2.5 resize-y min-h-20", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(control, "h-10 pr-8 cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

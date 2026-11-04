import { cn } from "../lib/cn.js";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface shadow-card", className)} {...props}>
      {children}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary-soft text-primary-soft-fg",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-2", className)} />;
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center text-center px-6 py-12", className)}>
      {Icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary-soft-fg">
          <Icon className="size-6" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

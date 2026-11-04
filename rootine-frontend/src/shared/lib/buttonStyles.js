import { cn } from "./cn.js";

const variants = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover shadow-card",
  secondary: "bg-surface text-text border border-border hover:bg-surface-2 shadow-card",
  soft: "bg-primary-soft text-primary-soft-fg hover:brightness-95",
  ghost: "text-muted hover:text-text hover:bg-surface-2",
  danger: "bg-danger text-danger-fg hover:brightness-110 shadow-card",
  "danger-ghost": "text-danger hover:bg-danger-soft",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg justify-center",
};

/** Class list shared by <Button> and <ButtonLink> so links can look like buttons. */
export const buttonClasses = ({ variant = "primary", size = "md", className } = {}) =>
  cn(
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none",
    "disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
    variants[variant],
    sizes[size],
    className,
  );

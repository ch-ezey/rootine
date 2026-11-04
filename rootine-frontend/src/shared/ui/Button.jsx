import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { buttonClasses } from "../lib/buttonStyles.js";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="size-4 shrink-0" aria-hidden />
      )}
      {children}
    </button>
  );
}

/** A navigation link styled as a button (never nest a <Button> inside a <Link>). */
export function ButtonLink({ to, variant = "primary", size = "md", icon: Icon, className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...props}>
      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      {children}
    </Link>
  );
}

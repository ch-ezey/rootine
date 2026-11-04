import { cn } from "../lib/cn.js";

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--primary)" />
      <path d="M16 25V14" stroke="var(--primary-fg)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 16c0-4.5 3-7 7.5-7 0 4.5-3 7-7.5 7Z" fill="var(--primary-fg)" opacity="0.65" />
      <path d="M16 19c0-3.6-2.4-5.6-6-5.6 0 3.6 2.4 5.6 6 5.6Z" fill="var(--primary-fg)" />
    </svg>
  );
}

export function Logo({ className }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight text-text", className)}>
      <LogoMark />
      <span className="text-lg">Rootine</span>
    </span>
  );
}

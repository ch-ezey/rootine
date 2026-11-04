import { Check, Clock, Flag } from "lucide-react";
import { Badge } from "./Card.jsx";
import { cn } from "../lib/cn.js";
import { formatDuration, formatTime, minutesToLabel, toMinutes } from "../lib/time.js";

/** Round tick button used wherever a task can be completed. */
export function CheckButton({ checked, onChange, label, className, disabled }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-all cursor-pointer",
        checked
          ? "border-primary bg-primary text-primary-fg scale-100"
          : "border-subtle text-transparent hover:border-primary hover:text-primary/40",
        className,
      )}
    >
      <Check className="size-3.5" strokeWidth={3} aria-hidden />
    </button>
  );
}

const PRIORITY_TONE = { high: "danger", medium: "warning", low: "neutral" };

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <Badge tone={PRIORITY_TONE[priority]}>
      <Flag className="size-3" aria-hidden />
      {priority[0].toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

/** "6:30 AM – 6:40 AM · 10 min" style summary of when a task happens. */
export function TaskTiming({ task, className }) {
  const start = toMinutes(task.startTime);
  const parts = [];
  if (start != null) {
    parts.push(
      task.duration ? `${formatTime(task.startTime)} – ${minutesToLabel(start + task.duration)}` : formatTime(task.startTime),
    );
  }
  if (task.duration) parts.push(formatDuration(task.duration));
  if (!parts.length) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted tabular-nums", className)}>
      <Clock className="size-3" aria-hidden />
      {parts.join(" · ")}
    </span>
  );
}

export function ProgressBar({ value, max, className }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-surface-2", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

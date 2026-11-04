import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../app/contexts/theme.context.js";
import { cn } from "../lib/cn.js";

const OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

/** Three-way System / Light / Dark control. `showLabels` adds text next to the icons. */
export function ThemeSwitcher({ showLabels = false, className }) {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className={cn("inline-flex gap-1 rounded-xl bg-surface-2 p-1", className)}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={showLabels ? undefined : label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              selected ? "bg-surface text-text shadow-card" : "text-muted hover:text-text",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {showLabels && label}
          </button>
        );
      })}
    </div>
  );
}

/** Compact sun/moon button that switches to the opposite of what's showing. */
export function ThemeToggleButton({ className }) {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";
  const Icon = resolvedTheme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn(
        "grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text cursor-pointer",
        className,
      )}
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}

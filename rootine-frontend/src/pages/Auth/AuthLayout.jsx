import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "../../shared/ui/Logo.jsx";
import { ThemeToggleButton } from "../../shared/ui/ThemeSwitcher.jsx";

const POINTS = [
  "Describe a routine in plain words and get a structured draft",
  "Reorder, edit and tick off steps as your day unfolds",
  "One active routine keeps today focused",
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <ThemeToggleButton />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 size-[28rem] rounded-full bg-white/5" />
        <div className="relative flex h-full flex-col justify-center px-16 text-primary-fg">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Build the days you want, one routine at a time.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-primary-fg/90">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

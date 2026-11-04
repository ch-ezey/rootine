import { Link, NavLink, Outlet } from "react-router-dom";
import { CalendarCheck, LayoutList, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../contexts/auth.context.js";
import { Logo } from "../../shared/ui/Logo.jsx";
import { cn } from "../../shared/lib/cn.js";

const NAV = [
  { to: "/today", label: "Today", icon: CalendarCheck },
  { to: "/routines", label: "Routines", icon: LayoutList },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

export function Avatar({ name, className }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary-soft-fg",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <Link to="/today" className="px-6 pt-6 pb-8">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary-soft text-primary-soft-fg" : "text-muted hover:bg-surface-2 hover:text-text",
                )
              }
            >
              <Icon className="size-[18px]" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-xl border border-border p-3">
          <Avatar name={user?.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text cursor-pointer"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/85 px-4 backdrop-blur lg:hidden">
        <Link to="/today">
          <Logo />
        </Link>
        <Link to="/profile" aria-label="Profile">
          <Avatar name={user?.name} className="size-8 text-xs" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
        <Outlet />
      </main>

      {/* Mobile tab bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted",
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

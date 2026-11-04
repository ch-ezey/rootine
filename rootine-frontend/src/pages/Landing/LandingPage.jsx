import { Link } from "react-router-dom";
import { ArrowRight, Check, GripVertical, ListChecks, Sparkles, SunMedium } from "lucide-react";
import { Logo } from "../../shared/ui/Logo.jsx";
import { cn } from "../../shared/lib/cn.js";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Describe it, get a draft",
    body: "Tell Rootine what your morning, workout or study block should look like. It drafts the steps, timings and priorities for you to review.",
  },
  {
    icon: ListChecks,
    title: "Stay in full control",
    body: "Every routine is fully editable: add, edit, delete and drag tasks into the order that works for you. Nothing is saved without you.",
  },
  {
    icon: SunMedium,
    title: "Focus on today",
    body: "Pick one active routine and follow it on a live timeline, ticking steps off as you go and starting fresh tomorrow.",
  },
];

const PREVIEW = [
  { time: "6:30", title: "Wake up & hydrate", meta: "10 min", done: true },
  { time: "6:40", title: "Stretching", meta: "15 min", done: true },
  { time: "6:55", title: "Plan the day", meta: "15 min · high", now: true },
  { time: "7:10", title: "Breakfast", meta: "20 min" },
];

function PreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-pop">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Active routine</p>
            <p className="mt-0.5 font-semibold">Weekday Morning</p>
          </div>
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">2 of 4 done</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full w-1/2 rounded-full bg-primary" />
        </div>
        <ul className="mt-4 space-y-2">
          {PREVIEW.map((t) => (
            <li
              key={t.title}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                t.now ? "border-primary/40 bg-primary-soft/60" : "border-border",
              )}
            >
              <GripVertical className="size-4 text-subtle" aria-hidden />
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border",
                  t.done ? "border-primary bg-primary text-primary-fg" : "border-subtle",
                )}
              >
                {t.done && <Check className="size-3" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", t.done && "text-muted line-through")}>{t.title}</p>
                <p className="text-xs text-muted">{t.meta}</p>
              </div>
              <span className="text-xs tabular-nums text-muted">{t.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:text-text">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-fg shadow-card hover:bg-primary-hover"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pt-10 pb-20 lg:grid-cols-2 lg:pt-20">
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-soft-fg">
            <Sparkles className="size-3.5" aria-hidden /> AI-assisted routines
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Routines that fit your day, <span className="text-primary">not the other way round.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Describe the routine you want, let Rootine draft it, then shape every step until it's right. Follow it
            on a simple timeline and build habits that stick.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-medium text-primary-fg shadow-card hover:bg-primary-hover"
            >
              Create your first routine <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 items-center rounded-xl border border-border bg-surface px-6 font-medium hover:bg-surface-2"
            >
              I have an account
            </Link>
          </div>
        </div>
        <PreviewCard />
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl p-2">
              <div className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary-soft-fg">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted">
        <Logo className="opacity-80" />
        <span>© {new Date().getFullYear()} Rootine</span>
      </footer>
    </div>
  );
}

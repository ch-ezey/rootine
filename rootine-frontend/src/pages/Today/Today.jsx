import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarCheck, PartyPopper, Pencil, RotateCcw, Sparkles, Timer } from "lucide-react";
import { useAuth } from "../../app/contexts/auth.context.js";
import {
  useActivateRoutine,
  useResetRoutine,
  useRoutine,
  useRoutines,
  useUpdateTask,
} from "../../services/queries.js";
import { Button, ButtonLink } from "../../shared/ui/Button.jsx";
import { Badge, Card, EmptyState, Skeleton } from "../../shared/ui/Card.jsx";
import { CheckButton, PriorityBadge, ProgressBar, TaskTiming } from "../../shared/ui/TaskBits.jsx";
import { formatDuration, greeting, minutesToLabel, nowMinutes, toMinutes, totalDuration } from "../../shared/lib/time.js";
import { cn } from "../../shared/lib/cn.js";

/** Re-renders every 30s so "now" stays current. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function taskStatus(task, minutesNow) {
  const start = toMinutes(task.startTime);
  if (task.isCompleted || start == null) return null;
  const end = start + (task.duration || 0);
  if (minutesNow >= start && minutesNow < end) return "now";
  if (minutesNow >= end) return "overdue";
  return null;
}

export default function Today() {
  const { user } = useAuth();
  const now = useNow();
  const routines = useRoutines();
  const active = routines.data?.find((r) => r.isActive);

  const firstName = user?.name?.split(" ")[0];
  const dateLabel = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted">{dateLabel}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting(now)}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </div>

      {routines.isPending ? (
        <TodaySkeleton />
      ) : !routines.data?.length ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Let's build your first routine"
            description="Create one from scratch or describe it and let AI draft the steps. Then make it active to follow it here."
            action={
              <ButtonLink to="/routines?new=1" icon={ArrowRight}>
                Create a routine
              </ButtonLink>
            }
          />
        </Card>
      ) : !active ? (
        <ChooseActive routines={routines.data} />
      ) : (
        <ActiveRoutine routineId={active.routineId} now={now} />
      )}
    </div>
  );
}

function ChooseActive({ routines }) {
  const activate = useActivateRoutine();
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-fg">
          <CalendarCheck className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="font-semibold">Which routine are you following today?</h2>
          <p className="mt-1 text-sm text-muted">Your active routine shows up here as a timeline you can tick off.</p>
        </div>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {routines.map((r) => (
          <li key={r.routineId} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{r.name}</p>
              {r.description && <p className="truncate text-sm text-muted">{r.description}</p>}
            </div>
            <Button
              variant="soft"
              size="sm"
              onClick={() => activate.mutate(r.routineId)}
              loading={activate.isPending && activate.variables === r.routineId}
            >
              Start
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ActiveRoutine({ routineId, now }) {
  const routine = useRoutine(routineId);
  const updateTask = useUpdateTask(routineId);
  const reset = useResetRoutine();
  const minutesNow = nowMinutes(now);

  const tasks = useMemo(() => routine.data?.tasks ?? [], [routine.data]);
  const done = tasks.filter((t) => t.isCompleted).length;
  const remaining = tasks.filter((t) => !t.isCompleted);

  // The task happening now, else the next one not yet done
  const upNext = useMemo(() => {
    const current = remaining.find((t) => taskStatus(t, minutesNow) === "now");
    if (current) return current;
    const later = remaining
      .filter((t) => toMinutes(t.startTime) != null && toMinutes(t.startTime) >= minutesNow)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    return later[0] ?? remaining[0];
  }, [remaining, minutesNow]);

  if (routine.isPending) return <TodaySkeleton />;
  if (routine.isError) {
    return (
      <Card>
        <EmptyState title="Couldn't load your routine" description="Check your connection and try again." />
      </Card>
    );
  }

  const r = routine.data;
  const toggle = (task, isCompleted) => updateTask.mutate({ taskId: task.taskId, isCompleted });
  const allDone = tasks.length > 0 && done === tasks.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="order-2 lg:order-1">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="font-semibold">Schedule</h2>
            <Badge tone="primary">{tasks.length} steps</Badge>
          </div>
          {tasks.length === 0 ? (
            <EmptyState
              icon={Pencil}
              title="This routine has no steps yet"
              description="Add a few tasks to start following it."
              action={
                <ButtonLink to={`/routines/${routineId}`} variant="soft">
                  Add tasks
                </ButtonLink>
              }
            />
          ) : (
            <Timeline tasks={tasks} minutesNow={minutesNow} onToggle={toggle} />
          )}
        </Card>
      </div>

      <div className="order-1 space-y-4 lg:order-2">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Active routine</p>
          <h2 className="mt-1 text-lg font-semibold leading-snug">{r.name}</h2>
          {r.description && <p className="mt-1 text-sm text-muted">{r.description}</p>}

          <div className="mt-5 flex items-baseline justify-between text-sm">
            <span className="font-medium">
              {done} of {tasks.length} done
            </span>
            {totalDuration(tasks) > 0 && (
              <span className="inline-flex items-center gap-1 text-muted">
                <Timer className="size-3.5" aria-hidden />
                {formatDuration(totalDuration(tasks))}
              </span>
            )}
          </div>
          <ProgressBar value={done} max={tasks.length} className="mt-2" />

          <div className="mt-5 flex gap-2">
            <ButtonLink to={`/routines/${routineId}`} variant="secondary" size="sm" icon={Pencil} className="flex-1">
              Edit
            </ButtonLink>
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => reset.mutate(routineId)}
              loading={reset.isPending}
              disabled={done === 0}
              title="Untick every step to start a fresh day"
            >
              New day
            </Button>
          </div>
        </Card>

        {allDone ? (
          <Card className="p-5 text-center">
            <PartyPopper className="mx-auto size-8 text-primary" aria-hidden />
            <p className="mt-2 font-semibold">Routine complete!</p>
            <p className="mt-1 text-sm text-muted">Every step is done. Nice work.</p>
          </Card>
        ) : (
          upNext && (
            <Card className="border-primary/30 bg-primary-soft/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {taskStatus(upNext, minutesNow) === "now" ? "Happening now" : "Up next"}
              </p>
              <div className="mt-2 flex items-start gap-3">
                <CheckButton
                  checked={false}
                  onChange={() => toggle(upNext, true)}
                  label={`Mark ${upNext.title} as done`}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <p className="font-medium">{upNext.title}</p>
                  <TaskTiming task={upNext} className="mt-1" />
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

/** Tasks in routine order, with a "now" marker placed by start time. */
function Timeline({ tasks, minutesNow, onToggle }) {
  const timed = tasks.some((t) => toMinutes(t.startTime) != null);
  // Index of the first task that starts after now; the marker goes just before it
  const markerIndex = timed
    ? tasks.findIndex((t) => {
        const s = toMinutes(t.startTime);
        return s != null && s > minutesNow;
      })
    : -1;

  return (
    <ol className="divide-y divide-border">
      {tasks.map((task, i) => {
        const status = taskStatus(task, minutesNow);
        return (
          <li key={task.taskId}>
            {i === markerIndex && <NowMarker minutesNow={minutesNow} />}
            <div
              className={cn(
                "flex items-start gap-4 px-5 py-4 transition-colors",
                status === "now" && "bg-primary-soft/40",
                task.isCompleted && "opacity-60",
              )}
            >
              <span className="w-16 shrink-0 pt-0.5 text-right text-xs font-medium tabular-nums text-muted">
                {task.startTime ? minutesToLabel(toMinutes(task.startTime)) : "Anytime"}
              </span>
              <CheckButton
                checked={task.isCompleted}
                onChange={(v) => onToggle(task, v)}
                label={`Mark ${task.title} as ${task.isCompleted ? "not done" : "done"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-medium", task.isCompleted && "line-through")}>{task.title}</p>
                  {status === "now" && <Badge tone="primary">Now</Badge>}
                  {status === "overdue" && <Badge tone="warning">Overdue</Badge>}
                </div>
                {task.description && <p className="mt-0.5 text-sm text-muted">{task.description}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <TaskTiming task={task} />
                  {task.priority === "high" && <PriorityBadge priority="high" />}
                </div>
              </div>
            </div>
          </li>
        );
      })}
      {timed && markerIndex === -1 && <NowMarker minutesNow={minutesNow} />}
    </ol>
  );
}

function NowMarker({ minutesNow }) {
  return (
    <div className="flex items-center gap-2 px-5 py-1" aria-label={`Current time ${minutesToLabel(minutesNow)}`}>
      <span className="w-16 shrink-0 text-right text-[11px] font-semibold tabular-nums text-danger">
        {minutesToLabel(minutesNow)}
      </span>
      <span className="size-2 rounded-full bg-danger" />
      <span className="h-px flex-1 bg-danger/60" />
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card className="space-y-4 p-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </Card>
      <Card className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-2 w-full" />
      </Card>
    </div>
  );
}

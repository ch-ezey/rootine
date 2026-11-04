import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, CheckCircle2, GripVertical, ListPlus, Pencil, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";
import {
  useActivateRoutine,
  useCreateTask,
  useDeleteRoutine,
  useDeleteTask,
  useReorderTasks,
  useResetRoutine,
  useRoutine,
  useUpdateRoutine,
  useUpdateTask,
} from "../../services/queries.js";
import { Button, ButtonLink } from "../../shared/ui/Button.jsx";
import { Badge, Card, EmptyState, Skeleton } from "../../shared/ui/Card.jsx";
import { ConfirmDialog, Dialog } from "../../shared/ui/Dialog.jsx";
import { Field, Input, Textarea } from "../../shared/ui/Field.jsx";
import { CheckButton, PriorityBadge, ProgressBar, TaskTiming } from "../../shared/ui/TaskBits.jsx";
import { TASK_TYPES } from "../../shared/lib/taskTypes.js";
import { formatDuration, totalDuration } from "../../shared/lib/time.js";
import { cn } from "../../shared/lib/cn.js";
import { DetailLevelField } from "../Routines/CreateRoutineDialog.jsx";
import TaskDialog from "./TaskDialog.jsx";

export default function RoutineDetail() {
  const { id } = useParams();
  const routineId = Number(id);
  const routine = useRoutine(routineId);
  const navigate = useNavigate();

  const updateRoutine = useUpdateRoutine();
  const activate = useActivateRoutine();
  const reset = useResetRoutine();
  const deleteRoutine = useDeleteRoutine();
  const createTask = useCreateTask(routineId);
  const updateTask = useUpdateTask(routineId);
  const deleteTask = useDeleteTask(routineId);
  const reorder = useReorderTasks(routineId);

  const [editingDetails, setEditingDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [taskDialog, setTaskDialog] = useState(null); // null | { task?: Task }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (routine.isPending) return <DetailSkeleton />;
  if (routine.isError) {
    const notFound = routine.error?.response?.status === 404;
    return (
      <Card>
        <EmptyState
          title={notFound ? "Routine not found" : "Couldn't load this routine"}
          description={notFound ? "It may have been deleted." : "Check your connection and try again."}
          action={
            <ButtonLink to="/routines" variant="secondary" icon={ArrowLeft}>
              Back to routines
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  const r = routine.data;
  const tasks = r.tasks;
  const done = tasks.filter((t) => t.isCompleted).length;

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = tasks.findIndex((t) => t.taskId === active.id);
    const to = tasks.findIndex((t) => t.taskId === over.id);
    reorder.mutate(arrayMove(tasks, from, to));
  };

  const submitTask = (payload) => {
    const editing = taskDialog?.task;
    const options = {
      onSuccess: () => {
        toast.success(editing ? "Task updated" : "Task added");
        setTaskDialog(null);
      },
    };
    if (editing) updateTask.mutate({ taskId: editing.taskId, ...payload }, options);
    else createTask.mutate(payload, options);
  };

  return (
    <div className="animate-fade-in">
      <Link to="/routines" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" aria-hidden /> Routines
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{r.name}</h1>
            {r.isActive && (
              <Badge tone="primary">
                <CheckCircle2 className="size-3" aria-hidden /> Active
              </Badge>
            )}
          </div>
          {r.description && <p className="mt-1.5 max-w-2xl text-muted">{r.description}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!r.isActive && (
            <Button
              variant="soft"
              onClick={() => activate.mutate(routineId, { onSuccess: () => toast.success("Now your active routine") })}
              loading={activate.isPending}
            >
              Make active
            </Button>
          )}
          <Button variant="secondary" icon={Pencil} onClick={() => setEditingDetails(true)}>
            Edit details
          </Button>
          <Button variant="danger-ghost" size="icon" aria-label="Delete routine" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">
                {done} of {tasks.length} done
              </span>
              {totalDuration(tasks) > 0 && (
                <span className="inline-flex items-center gap-1 text-muted">
                  <Timer className="size-3.5" aria-hidden /> {formatDuration(totalDuration(tasks))} planned
                </span>
              )}
            </div>
            <ProgressBar value={done} max={tasks.length} className="mt-2" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={() => reset.mutate(routineId, { onSuccess: () => toast.success("Fresh start: all steps unticked") })}
            loading={reset.isPending}
            disabled={done === 0}
          >
            New day
          </Button>
        </Card>
      )}

      {/* Tasks */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">Tasks</h2>
            {tasks.length > 1 && <p className="text-xs text-muted">Drag to reorder. Changes save automatically.</p>}
          </div>
          <Button size="sm" icon={Plus} onClick={() => setTaskDialog({})}>
            Add task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            icon={ListPlus}
            title="No tasks yet"
            description="Break the routine into steps. Give them start times to see them on your Today timeline."
            action={
              <Button icon={Plus} onClick={() => setTaskDialog({})}>
                Add the first task
              </Button>
            }
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={tasks.map((t) => t.taskId)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-border">
                {tasks.map((task) => (
                  <SortableTask
                    key={task.taskId}
                    task={task}
                    onToggle={(isCompleted) => updateTask.mutate({ taskId: task.taskId, isCompleted })}
                    onEdit={() => setTaskDialog({ task })}
                    onDelete={() =>
                      deleteTask.mutate(task.taskId, { onSuccess: () => toast.success(`Deleted "${task.title}"`) })
                    }
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <TaskDialog
        open={Boolean(taskDialog)}
        task={taskDialog?.task}
        onClose={() => setTaskDialog(null)}
        onSubmit={submitTask}
        loading={createTask.isPending || updateTask.isPending}
      />
      <EditDetailsDialog
        open={editingDetails}
        routine={r}
        loading={updateRoutine.isPending}
        onClose={() => setEditingDetails(false)}
        onSave={(updates) =>
          updateRoutine.mutate(
            { id: routineId, ...updates },
            {
              onSuccess: () => {
                toast.success("Routine updated");
                setEditingDetails(false);
              },
            },
          )
        }
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete "${r.name}"?`}
        description={`This permanently deletes the routine and its ${tasks.length} task${tasks.length === 1 ? "" : "s"}.`}
        loading={deleteRoutine.isPending}
        onConfirm={() =>
          deleteRoutine.mutate(routineId, {
            onSuccess: () => {
              toast.success("Routine deleted");
              navigate("/routines", { replace: true });
            },
          })
        }
      />
    </div>
  );
}

function SortableTask({ task, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
  });
  const type = TASK_TYPES[task.taskType];

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative flex items-start gap-3 bg-surface px-3 py-4 sm:px-4",
        isDragging && "z-10 rounded-xl shadow-pop ring-1 ring-primary/30",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${task.title}`}
        className="mt-0.5 grid size-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-subtle hover:bg-surface-2 hover:text-text active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <CheckButton
        checked={task.isCompleted}
        onChange={onToggle}
        label={`Mark ${task.title} as ${task.isCompleted ? "not done" : "done"}`}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium", task.isCompleted && "text-muted line-through")}>{task.title}</p>
        {task.description && <p className="mt-0.5 text-sm text-muted">{task.description}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <TaskTiming task={task} />
          <PriorityBadge priority={task.priority} />
          {type && (
            <Badge>
              <type.icon className="size-3" aria-hidden />
              {type.label}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <Button variant="ghost" size="icon" aria-label={`Edit ${task.title}`} onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>
        <Button variant="danger-ghost" size="icon" aria-label={`Delete ${task.title}`} onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}

function EditDetailsDialog({ open, routine, onClose, onSave, loading }) {
  return (
    <Dialog open={open} onClose={onClose} title="Edit routine">
      {open && <DetailsForm routine={routine} onSave={onSave} onCancel={onClose} loading={loading} />}
    </Dialog>
  );
}

function DetailsForm({ routine, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name: routine.name,
    description: routine.description ?? "",
    detailLevel: routine.detailLevel,
  });
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name: form.name.trim(), description: form.description.trim(), detailLevel: form.detailLevel });
      }}
    >
      <Field label="Name">
        {(p) => (
          <Input {...p} maxLength={255} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        )}
      </Field>
      <Field label="Description">
        {(p) => (
          <Textarea
            {...p}
            rows={3}
            maxLength={1000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        )}
      </Field>
      <DetailLevelField value={form.detailLevel} onChange={(v) => setForm({ ...form, detailLevel: v })} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={!form.name.trim()}>
          Save
        </Button>
      </div>
    </form>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-64" />
      <Card className="space-y-5 p-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-6" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </Card>
    </div>
  );
}

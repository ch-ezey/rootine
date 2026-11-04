import { useState } from "react";
import { Button } from "../../shared/ui/Button.jsx";
import { Dialog } from "../../shared/ui/Dialog.jsx";
import { Field, Input, Select, Textarea } from "../../shared/ui/Field.jsx";
import { TASK_TYPES } from "../../shared/lib/taskTypes.js";
import { toInputTime } from "../../shared/lib/time.js";

const fromTask = (task) => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  startTime: toInputTime(task?.startTime),
  duration: task?.duration ?? "",
  priority: task?.priority ?? "medium",
  taskType: task?.taskType ?? "routine",
});

/**
 * Add or edit a task. `onSubmit` receives an API payload; for edits, cleared
 * time/duration are sent as explicit clear flags (null means "unchanged").
 */
export default function TaskDialog({ open, task, onClose, onSubmit, loading }) {
  return (
    <Dialog open={open} onClose={onClose} title={task ? "Edit task" : "Add task"}>
      {/* Remount per task so the form starts from that task's values */}
      {open && <TaskForm key={task?.taskId ?? "new"} task={task} onSubmit={onSubmit} onCancel={onClose} loading={loading} />}
    </Dialog>
  );
}

function TaskForm({ task, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(() => fromTask(task));
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const durationInvalid = form.duration !== "" && !(Number(form.duration) > 0);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || durationInvalid) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      taskType: form.taskType,
      priority: form.priority,
      startTime: form.startTime || null,
      duration: form.duration === "" ? null : Number(form.duration),
    };
    if (task) {
      payload.clearStartTime = !form.startTime && Boolean(task.startTime);
      payload.clearDuration = form.duration === "" && Boolean(task.duration);
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title">
        {(p) => (
          <Input {...p} value={form.title} onChange={set("title")} maxLength={150} placeholder="e.g. Stretch" autoFocus />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start time" hint="Optional">
          {(p) => <Input {...p} type="time" value={form.startTime} onChange={set("startTime")} />}
        </Field>
        <Field label="Duration (min)" hint="Optional" error={durationInvalid ? "Must be more than 0" : undefined}>
          {(p) => (
            <Input {...p} type="number" min={1} inputMode="numeric" value={form.duration} onChange={set("duration")} />
          )}
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority">
          {(p) => (
            <Select {...p} value={form.priority} onChange={set("priority")}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          )}
        </Field>
        <Field label="Type">
          {(p) => (
            <Select {...p} value={form.taskType} onChange={set("taskType")}>
              {Object.entries(TASK_TYPES).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field label="Notes" hint="Optional">
        {(p) => (
          <Textarea {...p} rows={2} maxLength={1000} value={form.description} onChange={set("description")} />
        )}
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={!form.title.trim() || durationInvalid}>
          {task ? "Save changes" : "Add task"}
        </Button>
      </div>
    </form>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "./api/httpClient.js";
import * as routineApi from "./api/routine.service.js";
import * as taskApi from "./api/task.service.js";
import * as userApi from "./api/user.service.js";

export const keys = {
  routines: ["routines"],
  routine: (id) => ["routine", Number(id)],
};

const notifyError = (fallback) => (error) => toast.error(getErrorMessage(error, fallback));

// ─── Routines ────────────────────────────────────────────────────────────────

export const useRoutines = () => useQuery({ queryKey: keys.routines, queryFn: routineApi.getRoutines });

export const useRoutine = (id) =>
  useQuery({
    queryKey: keys.routine(id),
    queryFn: () => routineApi.getRoutine(id),
    enabled: Number.isFinite(Number(id)) && id != null,
  });

export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: routineApi.createRoutine,
    onSuccess: (routine) => {
      qc.setQueryData(keys.routine(routine.routineId), routine);
      qc.invalidateQueries({ queryKey: keys.routines });
    },
    onError: notifyError("Couldn't create the routine."),
  });
}

/** Merges a routine summary returned by the API into both caches. */
function mergeRoutine(qc, summary) {
  qc.setQueryData(keys.routine(summary.routineId), (old) => (old ? { ...old, ...summary } : old));
  qc.setQueryData(keys.routines, (old) =>
    old?.map((r) => (r.routineId === summary.routineId ? { ...r, ...summary } : r)),
  );
}

export function useUpdateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }) => routineApi.updateRoutine(id, updates),
    onSuccess: (summary) => mergeRoutine(qc, summary),
    onError: notifyError("Couldn't save the routine."),
  });
}

export function useActivateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: routineApi.activateRoutine,
    // Optimistic: exactly one active routine
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.routines });
      const previous = qc.getQueryData(keys.routines);
      qc.setQueryData(keys.routines, (old) => old?.map((r) => ({ ...r, isActive: r.routineId === id })));
      return { previous };
    },
    onError: (error, _id, ctx) => {
      qc.setQueryData(keys.routines, ctx?.previous);
      notifyError("Couldn't activate the routine.")(error);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.routines });
      qc.invalidateQueries({ queryKey: ["routine"] });
    },
  });
}

export function useResetRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: routineApi.resetRoutine,
    onSuccess: (routine) => qc.setQueryData(keys.routine(routine.routineId), routine),
    onError: notifyError("Couldn't reset the routine."),
  });
}

export function useDeleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: routineApi.deleteRoutine,
    onSuccess: (_data, id) => {
      qc.setQueryData(keys.routines, (old) => old?.filter((r) => r.routineId !== id));
      qc.removeQueries({ queryKey: keys.routine(id) });
    },
    onError: notifyError("Couldn't delete the routine."),
  });
}

// ─── Tasks (all cached inside their routine) ────────────────────────────────

const updateTasks = (qc, routineId, fn) =>
  qc.setQueryData(keys.routine(routineId), (old) => (old ? { ...old, tasks: fn(old.tasks) } : old));

export function useCreateTask(routineId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (task) => taskApi.createTask({ routineId, ...task }),
    onSuccess: (task) => updateTasks(qc, routineId, (tasks) => [...tasks, task]),
    onError: notifyError("Couldn't add the task."),
  });
}

export function useUpdateTask(routineId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...updates }) => taskApi.updateTask(taskId, updates),
    // Optimistic, so ticking a task feels instant
    onMutate: async ({ taskId, ...updates }) => {
      await qc.cancelQueries({ queryKey: keys.routine(routineId) });
      const previous = qc.getQueryData(keys.routine(routineId));
      updateTasks(qc, routineId, (tasks) => tasks.map((t) => (t.taskId === taskId ? { ...t, ...updates } : t)));
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      qc.setQueryData(keys.routine(routineId), ctx?.previous);
      notifyError("Couldn't save the task.")(error);
    },
    onSuccess: (task) => updateTasks(qc, routineId, (tasks) => tasks.map((t) => (t.taskId === task.taskId ? task : t))),
  });
}

export function useDeleteTask(routineId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: (_data, taskId) => updateTasks(qc, routineId, (tasks) => tasks.filter((t) => t.taskId !== taskId)),
    onError: notifyError("Couldn't delete the task."),
  });
}

export function useReorderTasks(routineId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedTasks) => taskApi.reorderTasks(routineId, orderedTasks.map((t) => t.taskId)),
    onMutate: async (orderedTasks) => {
      await qc.cancelQueries({ queryKey: keys.routine(routineId) });
      const previous = qc.getQueryData(keys.routine(routineId));
      updateTasks(qc, routineId, () => orderedTasks.map((t, i) => ({ ...t, position: i })));
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      qc.setQueryData(keys.routine(routineId), ctx?.previous);
      notifyError("Couldn't save the new order.")(error);
    },
  });
}

// ─── Account ─────────────────────────────────────────────────────────────────

export function useUpdateMe() {
  return useMutation({ mutationFn: userApi.updateMe, onError: notifyError("Couldn't save your profile.") });
}

export function useDeleteMe() {
  return useMutation({ mutationFn: userApi.deleteMe, onError: notifyError("Couldn't delete your account.") });
}

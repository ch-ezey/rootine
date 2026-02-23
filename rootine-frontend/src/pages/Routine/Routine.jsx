import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api/httpClient.js";
import {
  getTasksByRoutineId,
  reorderTasks,
  updateTask,
} from "../../services/api/task.service.js";

/**
 * MVP Routine page:
 * - Fetch routine details
 * - Fetch tasks (ordered by backend: position asc, taskId asc)
 * - Allow moving tasks up/down (local reorder)
 * - Save ordering in one call via bulk reorder endpoint
 *
 * Notes about API shape (backend):
 * - GET  /routine/{id} returns Routine with fields: routineId, name, description, ...
 * - GET  /task/routine/{routineId} returns Task[] with fields: taskId, title, startTime, duration, priority, taskType, position...
 * - PUT  /task/routine/{routineId}/reorder body: { orderedTaskIds: number[] } returns 204
 */

export default function Routine() {
  const { id } = useParams();
  const routineId = Number(id);

  const [routine, setRoutine] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingRoutine, setLoadingRoutine] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [reorderDirty, setReorderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const [error, setError] = useState(null);

  const orderedTaskIds = useMemo(() => tasks.map((t) => t.taskId), [tasks]);

  useEffect(() => {
    let cancelled = false;

    const loadRoutine = async () => {
      setLoadingRoutine(true);
      setError(null);
      try {
        const res = await API.get(`/routine/${routineId}`);
        if (cancelled) return;
        setRoutine(res.data);
      } catch (e) {
        if (cancelled) return;
        setError(
          e?.response?.data?.message ?? e?.message ?? "Failed to load routine.",
        );
      } finally {
        if (!cancelled) setLoadingRoutine(false);
      }
    };

    if (Number.isFinite(routineId)) loadRoutine();

    return () => {
      cancelled = true;
    };
  }, [routineId]);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      setLoadingTasks(true);
      setError(null);
      try {
        const data = await getTasksByRoutineId(routineId);
        if (cancelled) return;
        setTasks(Array.isArray(data) ? data : []);
        setReorderDirty(false);
      } catch (e) {
        if (cancelled) return;
        setError(
          e?.response?.data?.message ?? e?.message ?? "Failed to load tasks.",
        );
      } finally {
        if (!cancelled) setLoadingTasks(false);
      }
    };

    if (Number.isFinite(routineId)) loadTasks();

    return () => {
      cancelled = true;
    };
  }, [routineId]);

  const moveTask = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= tasks.length) return;

    setTasks((prev) => {
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = tmp;
      return next;
    });
    setReorderDirty(true);
  };

  const saveOrder = async () => {
    if (!reorderDirty || savingOrder) return;

    setSavingOrder(true);
    setError(null);

    try {
      await reorderTasks(routineId, orderedTaskIds);

      // Optional: also update each task's position in-memory to reflect the saved state
      setTasks((prev) =>
        prev.map((t, idx) => ({
          ...t,
          position: idx,
        })),
      );

      setReorderDirty(false);
    } catch (e) {
      setError(
        e?.response?.data?.message ?? e?.message ?? "Failed to save ordering.",
      );
    } finally {
      setSavingOrder(false);
    }
  };

  const toggleComplete = async (task) => {
    setError(null);

    // optimistic UI
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === task.taskId ? { ...t, isCompleted: !t.isCompleted } : t,
      ),
    );

    try {
      await updateTask(task.taskId, { isCompleted: !task.isCompleted });
    } catch (e) {
      // rollback
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === task.taskId
            ? { ...t, isCompleted: task.isCompleted }
            : t,
        ),
      );

      setError(
        e?.response?.data?.message ??
          e?.message ??
          "Failed to update task completion.",
      );
    }
  };

  if (loadingRoutine) return <p>Loading routine...</p>;
  if (error && !routine) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!routine) return <p>Routine not found.</p>;

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>{routine.name ?? "Routine"}</h1>
        {reorderDirty ? (
          <span style={{ fontSize: 12, color: "#b45309" }}>
            Order changed (not saved)
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#15803d" }}>Order saved</span>
        )}
      </div>

      {routine.description ? (
        <p style={{ marginTop: 8 }}>{routine.description}</p>
      ) : null}

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          onClick={saveOrder}
          disabled={!reorderDirty || savingOrder}
          style={{ padding: "8px 12px" }}
        >
          {savingOrder ? "Saving..." : "Save order"}
        </button>

        <button
          onClick={() => {
            // reload tasks from backend, discarding local order
            setLoadingTasks(true);
            setError(null);
            getTasksByRoutineId(routineId)
              .then((data) => {
                setTasks(Array.isArray(data) ? data : []);
                setReorderDirty(false);
              })
              .catch((e) => {
                setError(
                  e?.response?.data?.message ??
                    e?.message ??
                    "Failed to reload tasks.",
                );
              })
              .finally(() => setLoadingTasks(false));
          }}
          disabled={savingOrder || loadingTasks}
          style={{ padding: "8px 12px" }}
        >
          Reset
        </button>

        {loadingTasks ? (
          <span style={{ fontSize: 12, color: "#555" }}>Loading tasks...</span>
        ) : null}
      </div>

      <h2 style={{ marginTop: 20 }}>Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {tasks.map((t, idx) => {
            const canUp = idx > 0;
            const canDown = idx < tasks.length - 1;

            return (
              <li
                key={t.taskId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr auto",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => moveTask(idx, -1)}
                    disabled={!canUp || savingOrder}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveTask(idx, 1)}
                    disabled={!canDown || savingOrder}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                <div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <strong
                      style={{
                        textDecoration: t.isCompleted ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </strong>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      {t.taskType ?? "routine"}
                    </span>
                    {t.startTime ? (
                      <span style={{ fontSize: 12, color: "#555" }}>
                        {t.startTime}
                      </span>
                    ) : null}
                    {typeof t.duration === "number" ? (
                      <span style={{ fontSize: 12, color: "#555" }}>
                        {t.duration} min
                      </span>
                    ) : null}
                    {t.priority ? (
                      <span style={{ fontSize: 12, color: "#555" }}>
                        {t.priority}
                      </span>
                    ) : null}
                  </div>

                  {t.description ? (
                    <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
                      {t.description}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "end" }}>
                  <label style={{ fontSize: 12, color: "#333" }}>
                    <input
                      type="checkbox"
                      checked={!!t.isCompleted}
                      onChange={() => toggleComplete(t)}
                      disabled={savingOrder}
                      style={{ marginRight: 6 }}
                    />
                    Completed
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

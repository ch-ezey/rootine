import React, { useState, useContext, useEffect, useMemo } from "react";
import { AuthContext } from "../../app/contexts/auth.context.js";

import {
  createRoutine,
  deleteRoutine,
  getRoutineByUserId,
  updateRoutine,
} from "../../services/api/routine.service.js";
import {
  getTasksByRoutineId,
  updateTask,
} from "../../services/api/task.service.js";

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [routines, setRoutines] = useState([]);
  const [newRoutine, setNewRoutine] = useState("");
  const [fetching, setFetching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [editError, setEditError] = useState(null);

  // Active routine tasks (MVP)
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Timeline UI state
  const [now, setNow] = useState(() => new Date());
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completeError, setCompleteError] = useState(null);

  // Task details modal
  const [selectedTask, setSelectedTask] = useState(null);

  const activeRoutine = useMemo(() => {
    const list = Array.isArray(routines) ? routines : [];
    return list.find((r) => r?.isActive) || null;
  }, [routines]);

  // --- Timeline helpers (MVP) ---
  const parseTimeToMinutes = (value) => {
    if (value == null) return null;

    // Accept common backend formats:
    // - LocalTime serialized as string: "06:30:00" or "06:30"
    // - ISO date-time string: "2026-02-23T06:30:00" (extract the time)
    // - Values that might include timezone suffix: "06:30:00Z" (strip it)
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;

      const tIndex = trimmed.indexOf("T");
      let timePart = tIndex >= 0 ? trimmed.slice(tIndex + 1) : trimmed;

      // Remove timezone suffix if present (e.g., "06:30:00Z", "06:30:00+00:00")
      timePart = timePart.replace(/Z$/i, "");
      timePart = timePart.replace(/([+-]\d{2}:\d{2})$/, "");

      const parts = timePart.split(":");
      if (parts.length < 2) return null;

      const hh = Number(parts[0]);
      const mm = Number(parts[1]);
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;

      // Basic sanity bounds
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

      return hh * 60 + mm;
    }

    return null;
  };

  const formatMinutes = (mins) => {
    if (mins == null) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const tasksForTimeline = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];

    const normalized = list
      .map((t) => {
        const startMins =
          parseTimeToMinutes(t?.startTime) ??
          parseTimeToMinutes(t?.start_time) ??
          parseTimeToMinutes(t?.start_time?.toString?.());
        const duration = Number(t?.duration ?? 0);
        const safeDuration = Number.isFinite(duration)
          ? Math.max(0, duration)
          : 0;

        const endMins = startMins == null ? null : startMins + safeDuration;

        return {
          ...t,
          __startMins: startMins,
          __endMins: endMins,
          __duration: safeDuration,
        };
      })
      // Only show tasks that have a start time + duration for the timeline
      .filter((t) => t.__startMins != null && t.__duration > 0)
      .sort((a, b) => a.__startMins - b.__startMins);

    return normalized;
  }, [tasks]);

  const timelineBounds = useMemo(() => {
    if (tasksForTimeline.length === 0) {
      // Default day view: 06:00 -> 22:00
      return { start: 6 * 60, end: 22 * 60 };
    }

    const minStart = Math.min(...tasksForTimeline.map((t) => t.__startMins));
    const maxEnd = Math.max(
      ...tasksForTimeline.map((t) => t.__endMins ?? t.__startMins),
    );

    // Pad view by 30 minutes on each side
    const start = Math.max(0, minStart - 30);
    const end = Math.min(24 * 60, maxEnd + 30);

    // Ensure at least 4 hours of vertical space
    const minSpan = 4 * 60;
    if (end - start < minSpan) {
      const mid = Math.floor((start + end) / 2);
      const half = Math.floor(minSpan / 2);
      return {
        start: clamp(mid - half, 0, 24 * 60),
        end: clamp(mid + half, 0, 24 * 60),
      };
    }

    return { start, end };
  }, [tasksForTimeline]);

  const nowMinutes = useMemo(
    () => now.getHours() * 60 + now.getMinutes(),
    [now],
  );

  const currentTask = useMemo(() => {
    const list = tasksForTimeline;
    if (list.length === 0) return null;
    const found = list.find(
      (t) =>
        nowMinutes >= t.__startMins &&
        nowMinutes < (t.__endMins ?? t.__startMins),
    );
    return found || null;
  }, [tasksForTimeline, nowMinutes]);

  const toggleComplete = async (task, checked) => {
    if (!task?.taskId) return;

    setCompletingTaskId(task.taskId);
    setCompleteError(null);

    // optimistic
    const previous = tasks;
    setTasks((prev) =>
      (prev || []).map((t) =>
        t.taskId === task.taskId ? { ...t, isCompleted: checked } : t,
      ),
    );

    try {
      const updated = await updateTask(task.taskId, {
        ...task,
        isCompleted: checked,
      });

      setTasks((prev) =>
        (prev || []).map((t) => (t.taskId === task.taskId ? updated : t)),
      );
    } catch (err) {
      console.error("Error updating task completion:", err);
      setTasks(previous);
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update task";
      setCompleteError(message);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Fetch routines for the current user
  useEffect(() => {
    const fetchRoutines = async () => {
      if (!user) return;

      setFetching(true);
      try {
        const routinesData = await getRoutineByUserId(user.id);
        setRoutines(routinesData);
        console.log("Fetched routines:", routinesData);
      } catch (err) {
        console.error("Error fetching routines:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchRoutines();
  }, [user]);

  // Fetch tasks for the active routine (MVP)
  useEffect(() => {
    const fetchTasks = async () => {
      setTasksError(null);

      if (!activeRoutine?.routineId) {
        setTasks([]);
        return;
      }

      setTasksLoading(true);
      try {
        const tasksData = await getTasksByRoutineId(activeRoutine.routineId);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (err) {
        console.error("Error fetching tasks for active routine:", err);
        const message =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to fetch tasks";
        setTasksError(message);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [activeRoutine?.routineId]);

  // Tick "now" every 30 seconds for the current-time indicator
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleAddRoutine = async () => {
    const name = newRoutine.trim();
    if (!name || !user) return;

    setAdding(true);
    setAddError(null);

    // Optimistic UI: immediately show a pending item
    const optimisticRoutine = {
      routineId: `optimistic-${Date.now()}`,
      name,
      description: "",
      detailLevel: "",
      isActive: false,
      __optimistic: true,
    };

    setRoutines((prev) => [optimisticRoutine, ...prev]);
    setNewRoutine("");

    try {
      // Backend sets the owning user from the JWT principal; userId is not required.
      const created = await createRoutine({
        name,
      });

      // Replace optimistic entry with the real one from API
      setRoutines((prev) =>
        prev.map((r) =>
          r.routineId === optimisticRoutine.routineId ? created : r,
        ),
      );
    } catch (err) {
      console.error("Error creating routine:", err);

      // Roll back optimistic entry
      setRoutines((prev) =>
        prev.filter((r) => r.routineId !== optimisticRoutine.routineId),
      );

      // Show a user-visible error
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to create routine";
      setAddError(message);

      // Restore the typed value so the user can retry quickly
      setNewRoutine(name);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!routineId) return;

    setDeletingId(routineId);
    setDeleteError(null);

    // Optimistic UI: remove immediately
    let removedRoutine = null;
    setRoutines((prev) => {
      removedRoutine = prev.find((r) => r.routineId === routineId) || null;
      return prev.filter((r) => r.routineId !== routineId);
    });

    try {
      await deleteRoutine(routineId);
    } catch (err) {
      console.error("Error deleting routine:", err);

      // Roll back optimistic removal
      if (removedRoutine) {
        setRoutines((prev) => [removedRoutine, ...prev]);
      }

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to delete routine";
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const startEditRoutine = (routine) => {
    if (!routine?.routineId || routine.__optimistic) return;
    setEditingId(routine.routineId);
    setEditName((routine.name || "").toString());
    setEditError(null);
  };

  const cancelEditRoutine = () => {
    setEditingId(null);
    setEditName("");
    setEditError(null);
  };

  const saveEditRoutine = async (routineId) => {
    const name = editName.trim();
    if (!routineId) return;

    if (!name) {
      setEditError("Routine name is required");
      return;
    }

    setSavingId(routineId);
    setEditError(null);

    // Optimistic UI: update name immediately
    let previousRoutine = null;
    setRoutines((prev) => {
      previousRoutine = prev.find((r) => r.routineId === routineId) || null;
      return prev.map((r) => (r.routineId === routineId ? { ...r, name } : r));
    });

    try {
      const updated = await updateRoutine(routineId, { name });
      setRoutines((prev) =>
        prev.map((r) => (r.routineId === routineId ? updated : r)),
      );
      cancelEditRoutine();
    } catch (err) {
      console.error("Error updating routine:", err);

      // Roll back optimistic name change
      if (previousRoutine) {
        setRoutines((prev) =>
          prev.map((r) => (r.routineId === routineId ? previousRoutine : r)),
        );
      }

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update routine";
      setEditError(message);
    } finally {
      setSavingId(null);
    }
  };

  const setActiveRoutine = async (routineId) => {
    if (!routineId) return;

    // Find currently active routine (if any)
    const currentActive = (routines || []).find((r) => r?.isActive) || null;

    // Optimistic UI: mark selected as active, others inactive
    const previousRoutines = routines;
    setRoutines((prev) =>
      (prev || []).map((r) =>
        r?.routineId === routineId
          ? { ...r, isActive: true }
          : { ...r, isActive: false },
      ),
    );

    try {
      // Backend doesn't provide a single "set active" endpoint, so we:
      // 1) deactivate previous active (if different)
      // 2) activate selected
      if (currentActive?.routineId && currentActive.routineId !== routineId) {
        await updateRoutine(currentActive.routineId, { isActive: false });
      }
      await updateRoutine(routineId, { isActive: true });
    } catch (err) {
      console.error("Error setting active routine:", err);
      // Roll back on failure
      setRoutines(previousRoutines);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (fetching) return <div>Fetching...</div>;
  if (!user) return <div>Please log in to access your dashboard.</div>;

  return (
    <div className="container">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Welcome, {user.name || user.email}!</h1>
        </div>

        {/* Active Routine Tasks (MVP) */}
        <div className="dashboard-section">
          <h2>Active Routine</h2>
          {activeRoutine ? (
            <>
              <p>
                <strong>{activeRoutine.name}</strong>
              </p>
              <p>Status: {activeRoutine.isActive ? "Active" : "Inactive"}</p>

              <h3>Timeline</h3>
              {tasksLoading ? <div>Loading tasks...</div> : null}
              {tasksError ? (
                <div style={{ color: "crimson", marginTop: 8 }}>
                  {tasksError}
                </div>
              ) : null}

              {!tasksLoading && !tasksError && tasksForTimeline.length === 0 ? (
                <div>
                  No scheduled tasks (missing start time and/or duration). Add
                  start time + duration to see a timeline.
                </div>
              ) : null}

              {!tasksLoading && !tasksError && tasksForTimeline.length > 0 ? (
                <>
                  {completeError ? (
                    <div style={{ color: "crimson", marginTop: 8 }}>
                      {completeError}
                    </div>
                  ) : null}

                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns: "110px 1fr",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    {/* Left column: labels + "where you should be" */}
                    <div>
                      <div style={{ fontSize: 12, color: "#555" }}>
                        Current time
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>
                        {now.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <div
                        style={{ marginTop: 12, fontSize: 12, color: "#555" }}
                      >
                        Ideally now
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {currentTask ? currentTask.title : "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {currentTask
                          ? `${formatMinutes(currentTask.__startMins)}–${formatMinutes(
                              currentTask.__endMins,
                            )}`
                          : ""}
                      </div>
                    </div>

                    {/* Right column: timeline */}
                    <div
                      style={{
                        position: "relative",
                        border: "1px solid #e6e6e6",
                        borderRadius: 12,
                        background: "#fff",
                        padding: 12,
                        overflow: "hidden",
                        minHeight: 420,
                      }}
                    >
                      {(() => {
                        const { start, end } = timelineBounds;
                        const span = Math.max(1, end - start);
                        const pxPerMin = 6; // visual density: 6px per minute (tweak as needed)
                        const height = span * pxPerMin;

                        const nowOffset = clamp(
                          (nowMinutes - start) * pxPerMin,
                          0,
                          height,
                        );

                        // Timeline blocks: height scales with duration (and overlap is allowed)
                        // Keep a minimum height so short tasks are still readable.
                        const minBlockHeight = 44;

                        // Hour gridlines
                        const gridlines = [];
                        const firstHour = Math.ceil(start / 60) * 60;
                        for (let m = firstHour; m <= end; m += 60) {
                          const top = (m - start) * pxPerMin;
                          gridlines.push({ m, top });
                        }

                        return (
                          <div
                            style={{
                              position: "relative",
                              height,
                            }}
                          >
                            {/* Gridlines (render above task blocks for readability) */}
                            {gridlines.map((g) => (
                              <div
                                key={g.m}
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  top: g.top,
                                  borderTop: "1px dashed #eee",
                                  zIndex: 3,
                                  pointerEvents: "none",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    top: -10,
                                    fontSize: 11,
                                    color: "#777",
                                    background: "rgba(255,255,255,0.9)",
                                    paddingRight: 6,
                                    zIndex: 4,
                                    pointerEvents: "none",
                                  }}
                                >
                                  {formatMinutes(g.m)}
                                </div>
                              </div>
                            ))}

                            {/* Now indicator */}
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: nowOffset,
                                height: 2,
                                background: "#ef4444",
                                zIndex: 5,
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: nowOffset - 10,
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#ef4444",
                                background: "rgba(255,255,255,0.9)",
                                paddingRight: 6,
                                zIndex: 6,
                                pointerEvents: "none",
                              }}
                            >
                              now
                            </div>

                            {/* Task blocks (duration-based height; overlap allowed) */}
                            {tasksForTimeline.map((t, idx) => {
                              const top = (t.__startMins - start) * pxPerMin;
                              const h = Math.max(
                                minBlockHeight,
                                (t.__duration || 0) * pxPerMin,
                              );

                              const isCurrent =
                                nowMinutes >= t.__startMins &&
                                nowMinutes < (t.__endMins ?? t.__startMins);

                              const completed = !!t.isCompleted;

                              return (
                                <div
                                  key={t.taskId || idx}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedTask(t)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      setSelectedTask(t);
                                    }
                                  }}
                                  style={{
                                    position: "absolute",
                                    left: 90,
                                    right: 8,
                                    top,
                                    height: h,
                                    borderRadius: 12,
                                    border: isCurrent
                                      ? "2px solid #2563eb"
                                      : "1px solid #e5e7eb",
                                    background: completed
                                      ? "#f0fdf4"
                                      : "#f8fafc",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                                    padding: 10,
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: 10,
                                    alignItems: "start",
                                    overflow: "hidden",
                                    opacity:
                                      completingTaskId === t.taskId ? 0.7 : 1,
                                    cursor: "pointer",
                                    zIndex: 2,
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontWeight: 800,
                                        textDecoration: completed
                                          ? "line-through"
                                          : "none",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                      title={t.title}
                                    >
                                      {t.title}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: "#555",
                                        marginTop: 2,
                                      }}
                                    >
                                      {formatMinutes(t.__startMins)}–
                                      {formatMinutes(t.__endMins)} •{" "}
                                      {t.__duration}m
                                    </div>
                                    {/* Description removed from card; shown in modal on click */}
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-end",
                                      gap: 6,
                                    }}
                                  >
                                    <label
                                      style={{
                                        display: "flex",
                                        gap: 8,
                                        alignItems: "center",
                                        fontSize: 12,
                                        color: "#111",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={completed}
                                        disabled={completingTaskId === t.taskId}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) =>
                                          toggleComplete(t, e.target.checked)
                                        }
                                      />
                                      Done
                                    </label>

                                    {isCurrent ? (
                                      <div
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 800,
                                          color: "#2563eb",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Current
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Time rail labels */}
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 80,
                              }}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Task details modal */}
                  {selectedTask ? (
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="Task details"
                      onClick={() => setSelectedTask(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setSelectedTask(null);
                      }}
                      tabIndex={-1}
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        zIndex: 2000,
                      }}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "relative",
                          zIndex: 2001,
                          width: "min(640px, 100%)",
                          background: "#fff",
                          borderRadius: 14,
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: 16,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={selectedTask.title}
                            >
                              {selectedTask.title}
                            </div>
                            <div style={{ fontSize: 12, color: "#555" }}>
                              {formatMinutes(selectedTask.__startMins)}–
                              {formatMinutes(selectedTask.__endMins)} •{" "}
                              {selectedTask.__duration}m
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedTask(null)}
                            style={{
                              border: "1px solid #e5e7eb",
                              background: "#fff",
                              borderRadius: 10,
                              padding: "6px 10px",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Close
                          </button>
                        </div>

                        {selectedTask.description ? (
                          <div
                            style={{
                              marginTop: 12,
                              fontSize: 14,
                              color: "#111",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {selectedTask.description}
                          </div>
                        ) : null}

                        <div
                          style={{
                            marginTop: 14,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              fontSize: 13,
                              color: "#111",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!!selectedTask.isCompleted}
                              disabled={
                                completingTaskId === selectedTask.taskId
                              }
                              onChange={(e) => {
                                toggleComplete(selectedTask, e.target.checked);
                                setSelectedTask((prev) =>
                                  prev
                                    ? { ...prev, isCompleted: e.target.checked }
                                    : prev,
                                );
                              }}
                            />
                            Done
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <div>
              No active routine set. Choose one below to view its tasks.
            </div>
          )}
        </div>

        {/* Manual Routine Management */}
        <div className="dashboard-section">
          <div className="routine-container">
            <div className="input-container">
              <h2>Your Routines</h2>
              <input
                name="routine-name"
                type="text"
                placeholder="Enter new routine"
                value={newRoutine}
                onChange={(e) => setNewRoutine(e.target.value)}
                disabled={adding}
              />
              <button onClick={handleAddRoutine} disabled={adding}>
                {adding ? "Adding..." : "Add Routine"}
              </button>
              {addError ? (
                <div style={{ color: "crimson", marginTop: 8 }}>{addError}</div>
              ) : null}
              {deleteError ? (
                <div style={{ color: "crimson", marginTop: 8 }}>
                  {deleteError}
                </div>
              ) : null}
              {editError ? (
                <div style={{ color: "crimson", marginTop: 8 }}>
                  {editError}
                </div>
              ) : null}
            </div>
            <div className="routines">
              <ul>
                {routines.map((routine, index) => (
                  <li key={routine.routineId || index}>
                    <div>
                      <strong>
                        {editingId === routine.routineId ? (
                          <>
                            <input
                              name="edit-routine-name"
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={savingId === routine.routineId}
                            />
                            <button
                              onClick={() => saveEditRoutine(routine.routineId)}
                              disabled={savingId === routine.routineId}
                            >
                              {savingId === routine.routineId
                                ? "Saving..."
                                : "Save"}
                            </button>
                            <button
                              onClick={cancelEditRoutine}
                              disabled={savingId === routine.routineId}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {routine.name}
                            {routine.__optimistic ? " (saving...)" : ""}
                          </>
                        )}
                      </strong>
                      <br />
                      {routine.description == null ? (
                        "No description"
                      ) : (
                        <p>Description: {routine.description}</p>
                      )}
                      <p>Detail Level: {routine.detailLevel}</p>
                      <p>Status: {routine.isActive ? "Active" : "Inactive"}</p>
                    </div>

                    <button
                      onClick={() => setActiveRoutine(routine.routineId)}
                      disabled={
                        routine.__optimistic ||
                        deletingId === routine.routineId ||
                        savingId === routine.routineId ||
                        editingId === routine.routineId ||
                        routine.isActive
                      }
                    >
                      {routine.isActive ? "Active" : "Set Active"}
                    </button>

                    <button
                      onClick={() => startEditRoutine(routine)}
                      disabled={
                        routine.__optimistic ||
                        deletingId === routine.routineId ||
                        savingId === routine.routineId ||
                        editingId === routine.routineId
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteRoutine(routine.routineId)}
                      disabled={
                        routine.__optimistic ||
                        deletingId === routine.routineId ||
                        savingId === routine.routineId
                      }
                    >
                      {deletingId === routine.routineId
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useContext, useEffect, useMemo } from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import {
  createRoutine,
  deleteRoutine,
  getRoutineByUserId,
  updateRoutine,
} from "../api/routine";
import { getTasksByRoutineId } from "../api/task";

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
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

  const navigate = useNavigate();

  const activeRoutine = useMemo(() => {
    const list = Array.isArray(routines) ? routines : [];
    return list.find((r) => r?.isActive) || null;
  }, [routines]);

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
      isActive: true,
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

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirect back to login
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
          <button onClick={handleLogout}>Logout</button>
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

              <h3>Tasks</h3>
              {tasksLoading ? <div>Loading tasks...</div> : null}
              {tasksError ? (
                <div style={{ color: "crimson", marginTop: 8 }}>
                  {tasksError}
                </div>
              ) : null}
              {!tasksLoading && !tasksError && tasks.length === 0 ? (
                <div>No tasks yet for the active routine.</div>
              ) : null}
              {!tasksLoading && !tasksError && tasks.length > 0 ? (
                <ul>
                  {tasks.map((t, idx) => (
                    <li key={t?.taskId || idx}>
                      <strong>{t?.name ?? "Untitled task"}</strong>
                      {t?.description ? <p>{t.description}</p> : null}
                    </li>
                  ))}
                </ul>
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

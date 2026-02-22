import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../AuthContext";
import { getUserById, updateUser } from "../api/user";
import {
  createRoutine,
  deleteRoutine,
  getRoutineByUserId,
  updateRoutine,
} from "../api/routine";

/**
 * MVP User Page
 * - Displays current user info (fetched fresh + from AuthContext)
 * - Allows basic user update (name only) as a safe MVP field
 * - Displays routines with CRUD-lite:
 *   - Create routine (name)
 *   - Rename routine (name)
 *   - Delete routine
 *   - Single-active toggle (only one routine active at a time)
 *
 * Notes:
 * - Backend RoutineController supports PUT /routine/{id} with isActive, name, etc.
 * - Backend currently does NOT enforce "only one active routine per user".
 *   This UI enforces it by deactivating any currently-active routine(s) before activating the selected one.
 * - This page assumes `AuthContext.user` contains `{ id, name, email }` shape.
 */

export default function User() {
  const { user, loading: authLoading } = useContext(AuthContext);

  // User info
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [userRecord, setUserRecord] = useState(null);

  // Minimal user edit (name only). Email/password are usually special flows.
  const [editingUser, setEditingUser] = useState(false);
  const [userNameDraft, setUserNameDraft] = useState("");

  // Routines
  const [routines, setRoutines] = useState([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [routinesError, setRoutinesError] = useState(null);

  // Create routine
  const [newRoutineName, setNewRoutineName] = useState("");
  const [creatingRoutine, setCreatingRoutine] = useState(false);
  const [createRoutineError, setCreateRoutineError] = useState(null);

  // Update routine
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [routineNameDraft, setRoutineNameDraft] = useState("");
  const [savingRoutineId, setSavingRoutineId] = useState(null);
  const [routineSaveError, setRoutineSaveError] = useState(null);

  // Delete routine
  const [deletingRoutineId, setDeletingRoutineId] = useState(null);
  const [routineDeleteError, setRoutineDeleteError] = useState(null);

  // Active toggle
  const [activatingRoutineId, setActivatingRoutineId] = useState(null);
  const [routineActivateError, setRoutineActivateError] = useState(null);

  // Derived: active routine(s)
  const activeRoutines = useMemo(
    () => (routines || []).filter((r) => r?.isActive),
    [routines],
  );

  // Load user record
  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;

      setUserLoading(true);
      setUserError(null);
      try {
        const fresh = await getUserById(user.id);
        setUserRecord(fresh);
        setUserNameDraft((fresh?.name ?? "").toString());
      } catch (err) {
        console.error("Error fetching user:", err);
        const message =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to fetch user";
        setUserError(message);
        // Don't set draft from AuthContext here to keep effect dependency minimal.
      } finally {
        setUserLoading(false);
      }
    };

    run();
  }, [user?.id]);

  // Initialize draft name from AuthContext once (and when it changes) if we don't have a fetched record yet.
  useEffect(() => {
    if (!userRecord?.name) {
      setUserNameDraft((user?.name ?? "").toString());
    }
  }, [user?.name, userRecord?.name]);

  // Load routines for user
  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;

      setRoutinesLoading(true);
      setRoutinesError(null);
      try {
        const data = await getRoutineByUserId(user.id);
        setRoutines(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching routines:", err);
        const message =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to fetch routines";
        setRoutinesError(message);
      } finally {
        setRoutinesLoading(false);
      }
    };

    run();
  }, [user?.id]);

  // ----- User editing (MVP: name only) -----
  const startEditUser = () => {
    setEditingUser(true);
    const currentName = (userRecord?.name ?? user?.name ?? "").toString();
    setUserNameDraft(currentName);
  };

  const cancelEditUser = () => {
    setEditingUser(false);
    setUserNameDraft((userRecord?.name ?? user?.name ?? "").toString());
  };

  const saveUserName = async () => {
    if (!user?.id) return;

    const name = userNameDraft.trim();
    if (!name) {
      setUserError("Name is required");
      return;
    }

    setUserLoading(true);
    setUserError(null);

    const previous = userRecord;

    // Optimistic update
    setUserRecord((prev) => ({
      ...(prev || {}),
      name,
    }));

    try {
      const updated = await updateUser(user.id, { name });
      setUserRecord(updated);
      setUserNameDraft((updated?.name ?? name).toString());
      setEditingUser(false);
    } catch (err) {
      console.error("Error updating user:", err);

      // rollback
      setUserRecord(previous);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update user";
      setUserError(message);
    } finally {
      setUserLoading(false);
    }
  };

  // ----- Routine CRUD -----
  const createNewRoutine = async () => {
    const name = newRoutineName.trim();
    if (!user?.id || !name) return;

    setCreatingRoutine(true);
    setCreateRoutineError(null);

    // Optimistic insert
    const optimistic = {
      routineId: `optimistic-${Date.now()}`,
      name,
      description: "",
      detailLevel: "medium",
      isActive: false,
      __optimistic: true,
    };

    setRoutines((prev) => [optimistic, ...(prev || [])]);
    setNewRoutineName("");

    try {
      // Backend binds routine.user from JWT principal; userId in body isn't required
      // but the existing frontend helper sends it, so keep consistent.
      const created = await createRoutine({ userId: user.id, name });

      setRoutines((prev) =>
        (prev || []).map((r) =>
          r.routineId === optimistic.routineId ? created : r,
        ),
      );
    } catch (err) {
      console.error("Error creating routine:", err);

      setRoutines((prev) =>
        (prev || []).filter((r) => r.routineId !== optimistic.routineId),
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to create routine";
      setCreateRoutineError(message);

      // restore typed value for quick retry
      setNewRoutineName(name);
    } finally {
      setCreatingRoutine(false);
    }
  };

  const startEditRoutine = (routine) => {
    if (!routine?.routineId || routine.__optimistic) return;
    setEditingRoutineId(routine.routineId);
    setRoutineNameDraft((routine?.name ?? "").toString());
    setRoutineSaveError(null);
  };

  const cancelEditRoutine = () => {
    setEditingRoutineId(null);
    setRoutineNameDraft("");
    setRoutineSaveError(null);
  };

  const saveRoutineName = async (routineId) => {
    const name = routineNameDraft.trim();
    if (!routineId) return;

    if (!name) {
      setRoutineSaveError("Routine name is required");
      return;
    }

    setSavingRoutineId(routineId);
    setRoutineSaveError(null);

    let previousRoutine = null;
    setRoutines((prev) => {
      previousRoutine =
        (prev || []).find((r) => r.routineId === routineId) || null;
      return (prev || []).map((r) =>
        r.routineId === routineId ? { ...r, name } : r,
      );
    });

    try {
      const updated = await updateRoutine(routineId, { name });
      setRoutines((prev) =>
        (prev || []).map((r) => (r.routineId === routineId ? updated : r)),
      );
      cancelEditRoutine();
    } catch (err) {
      console.error("Error updating routine:", err);

      if (previousRoutine) {
        setRoutines((prev) =>
          (prev || []).map((r) =>
            r.routineId === routineId ? previousRoutine : r,
          ),
        );
      }

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update routine";
      setRoutineSaveError(message);
    } finally {
      setSavingRoutineId(null);
    }
  };

  const removeRoutine = async (routineId) => {
    if (!routineId) return;

    setDeletingRoutineId(routineId);
    setRoutineDeleteError(null);

    let removed = null;
    setRoutines((prev) => {
      removed = (prev || []).find((r) => r.routineId === routineId) || null;
      return (prev || []).filter((r) => r.routineId !== routineId);
    });

    try {
      await deleteRoutine(routineId);
    } catch (err) {
      console.error("Error deleting routine:", err);

      // rollback
      if (removed) setRoutines((prev) => [removed, ...(prev || [])]);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to delete routine";
      setRoutineDeleteError(message);
    } finally {
      setDeletingRoutineId(null);
    }
  };

  // ----- Single-active toggle -----
  const setActiveRoutine = async (routineId) => {
    if (!routineId) return;

    setActivatingRoutineId(routineId);
    setRoutineActivateError(null);

    const previous = routines;

    // Optimistic: only one active
    setRoutines((prev) =>
      (prev || []).map((r) => ({
        ...r,
        isActive: r.routineId === routineId,
      })),
    );

    try {
      // Deactivate any active routines other than the target
      const toDeactivate = (previous || []).filter(
        (r) => r.routineId !== routineId && r.isActive,
      );

      for (const r of toDeactivate) {
        await updateRoutine(r.routineId, { isActive: false });
      }

      await updateRoutine(routineId, { isActive: true });
    } catch (err) {
      console.error("Error setting active routine:", err);

      // rollback
      setRoutines(previous);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to set active routine";
      setRoutineActivateError(message);
    } finally {
      setActivatingRoutineId(null);
    }
  };

  if (authLoading) return <div className="container">Loading...</div>;
  if (!user)
    return (
      <div className="container">Please log in to view your user page.</div>
    );

  const displayName = userRecord?.name ?? user?.name ?? "(no name)";
  const displayEmail = userRecord?.email ?? user?.email ?? "(no email)";
  const displayId = userRecord?.userId ?? user?.id ?? "(unknown)";

  return (
    <div className="container">
      <h1>User</h1>

      {/* User Info */}
      <section
        className="dashboard-section"
        style={{ alignItems: "flex-start", textAlign: "left" }}
      >
        <h2>Your info</h2>

        {userLoading ? <div>Fetching user...</div> : null}
        {userError ? <div style={{ color: "crimson" }}>{userError}</div> : null}

        <div style={{ marginTop: 8 }}>
          <div>
            <strong>ID:</strong> {displayId}
          </div>
          <div>
            <strong>Email:</strong> {displayEmail}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Name:</strong>{" "}
            {editingUser ? (
              <input
                name="user-name"
                type="text"
                value={userNameDraft}
                onChange={(e) => setUserNameDraft(e.target.value)}
              />
            ) : (
              displayName
            )}
          </div>

          <div
            style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {editingUser ? (
              <>
                <button onClick={saveUserName}>Save</button>
                <button onClick={cancelEditUser}>Cancel</button>
              </>
            ) : (
              <button onClick={startEditUser}>Edit</button>
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
            Tip: updating your name is saved to the API.
          </div>
        </div>
      </section>

      {/* Routines */}
      <section
        className="dashboard-section"
        style={{ alignItems: "stretch", textAlign: "left" }}
      >
        <h2>Your routines</h2>

        {routinesLoading ? <div>Fetching routines...</div> : null}
        {routinesError ? (
          <div style={{ color: "crimson" }}>{routinesError}</div>
        ) : null}
        {routineDeleteError ? (
          <div style={{ color: "crimson" }}>{routineDeleteError}</div>
        ) : null}
        {routineSaveError ? (
          <div style={{ color: "crimson" }}>{routineSaveError}</div>
        ) : null}
        {routineActivateError ? (
          <div style={{ color: "crimson" }}>{routineActivateError}</div>
        ) : null}

        {/* Active routine sanity warning */}
        {activeRoutines.length > 1 ? (
          <div style={{ marginTop: 8, color: "crimson" }}>
            Warning: multiple active routines detected. Use “Set Active” to fix.
          </div>
        ) : null}

        {/* Create routine */}
        <div style={{ marginTop: 10 }}>
          <h3>Create routine</h3>
          <input
            name="new-routine-name"
            type="text"
            placeholder="Routine name"
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            disabled={creatingRoutine}
          />
          <button onClick={createNewRoutine} disabled={creatingRoutine}>
            {creatingRoutine ? "Creating..." : "Create"}
          </button>
          {createRoutineError ? (
            <div style={{ color: "crimson", marginTop: 8 }}>
              {createRoutineError}
            </div>
          ) : null}
        </div>

        {/* Routine list */}
        <div style={{ marginTop: 16 }}>
          <h3>Routine list</h3>

          {(!routines || routines.length === 0) && !routinesLoading ? (
            <div>No routines yet.</div>
          ) : null}

          <ul>
            {(routines || []).map((r) => {
              const isEditing = editingRoutineId === r.routineId;
              const isSaving = savingRoutineId === r.routineId;
              const isDeleting = deletingRoutineId === r.routineId;
              const isActivating = activatingRoutineId === r.routineId;

              return (
                <li key={r.routineId}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div>
                        <strong>
                          {isEditing ? (
                            <input
                              name="edit-routine-name"
                              type="text"
                              value={routineNameDraft}
                              onChange={(e) =>
                                setRoutineNameDraft(e.target.value)
                              }
                              disabled={isSaving}
                            />
                          ) : (
                            <>
                              {r.name} {r.__optimistic ? "(saving...)" : ""}
                            </>
                          )}
                        </strong>
                      </div>

                      <div
                        style={{ marginTop: 6, fontSize: 14, color: "#444" }}
                      >
                        <div>Status: {r.isActive ? "Active" : "Inactive"}</div>
                        <div>Detail Level: {r.detailLevel ?? "(unset)"}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        minWidth: 160,
                      }}
                    >
                      <button
                        onClick={() => setActiveRoutine(r.routineId)}
                        disabled={
                          r.__optimistic ||
                          isSaving ||
                          isDeleting ||
                          isActivating ||
                          r.isActive
                        }
                      >
                        {r.isActive
                          ? "Active"
                          : isActivating
                            ? "Setting..."
                            : "Set Active"}
                      </button>

                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveRoutineName(r.routineId)}
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving..." : "Save name"}
                          </button>
                          <button
                            onClick={cancelEditRoutine}
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditRoutine(r)}
                          disabled={
                            r.__optimistic ||
                            isSaving ||
                            isDeleting ||
                            isActivating
                          }
                        >
                          Edit name
                        </button>
                      )}

                      <button
                        onClick={() => removeRoutine(r.routineId)}
                        disabled={
                          r.__optimistic ||
                          isSaving ||
                          isDeleting ||
                          isActivating
                        }
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

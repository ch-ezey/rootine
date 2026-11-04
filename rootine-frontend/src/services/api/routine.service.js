import API from "./httpClient";

// Current user's routines (without tasks)
export const getRoutines = async () => {
  const res = await API.get("/routine");
  return res.data;
};

// Single routine with its tasks, in order
export const getRoutine = async (id) => {
  const res = await API.get(`/routine/${id}`);
  return res.data;
};

// Accepts nested `tasks` to create a routine and its tasks in one request
export const createRoutine = async (routine) => {
  const res = await API.post("/routine", routine);
  return res.data;
};

export const updateRoutine = async (id, routineUpdates) => {
  const res = await API.put(`/routine/${id}`, routineUpdates);
  return res.data;
};

// Makes this the user's only active routine (atomic on the server)
export const activateRoutine = async (id) => {
  const res = await API.post(`/routine/${id}/activate`);
  return res.data;
};

// Marks every task in the routine as not completed (start a fresh day)
export const resetRoutine = async (id) => {
  const res = await API.post(`/routine/${id}/reset`);
  return res.data;
};

export const deleteRoutine = async (id) => {
  await API.delete(`/routine/${id}`);
};

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

export const deleteRoutine = async (id) => {
  const res = await API.delete(`/routine/${id}`);
  return res.data;
};

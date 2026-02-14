import API from "./api";

export const getTasks = async () => {
  const res = await API.get("/tasks");
  return res.data;
};

export const getTaskById = async (taskId) => {
  const res = await API.get(`/${taskId}`);
  return res.data;
};

export const getTasksByRoutineId = async (routineId) => {
  const res = await API.get(`/tasks/routine/${routineId}`);
  return res.data;
};

export const createTask = async (task) => {
  const res = await API.post("/tasks", task);
  return res.data;
};

export const updateTask = async (taskId, task) => {
  const res = await API.put(`/tasks/${taskId}`, task);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await API.delete(`/tasks/${taskId}`);
  return res.data;
};

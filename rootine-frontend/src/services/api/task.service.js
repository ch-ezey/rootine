import API from "./httpClient.js";

/**
 * Backend controller base path: /task
 *
 * Available endpoints:
 * - GET    /task/tasks
 * - GET    /task/{id}
 * - GET    /task/routine/{routineId}
 * - POST   /task?routineId={routineId}
 * - PUT    /task/{id}
 * - DELETE /task/{id}
 */

export const getTasks = async () => {
  const res = await API.get("/task/tasks");
  return res.data;
};

export const getTaskById = async (taskId) => {
  const res = await API.get(`/task/${taskId}`);
  return res.data;
};

export const getTasksByRoutineId = async (routineId) => {
  const res = await API.get(`/task/routine/${routineId}`);
  return res.data;
};

export const createTask = async ({ routineId, ...task }) => {
  const res = await API.post("/task", task, { params: { routineId } });
  return res.data;
};

export const updateTask = async (taskId, task) => {
  const res = await API.put(`/task/${taskId}`, task);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await API.delete(`/task/${taskId}`);
  return res.data;
};
